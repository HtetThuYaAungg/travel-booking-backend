import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, PermissionDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserService } from '../user/user.service';
import { FilterRoleDto } from './dto/filter-role-dto';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { Role, Prisma, Status } from '@prisma/client';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/utils/constants';
import { PermissionService } from '../permission/permission.service';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
  ) {}

  async createRole(createRoleDto: CreateRoleDto, req: Request): Promise<Role> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    // Check if a role with this code exists (including soft-deleted ones)
    const existingRole = await this.prisma.role.findFirst({
      where: { role_code: createRoleDto.role_code, deleted_at: null },
    });

    let createdRole: Role;

    if (existingRole) {
      throw new BadRequestException(
        `Role with code '${createRoleDto.role_code}' already exists`,
      );
    } else {
      createdRole = await this.prisma.role.create({
        data: {
          role_code: createRoleDto.role_code,
          role_name: createRoleDto.role_name,
          permissions: JSON.parse(JSON.stringify(createRoleDto.permissions)),
          created_by: { connect: { id: currentUser.id } },
        },
      });
    }

    await this.createRolePermissionRelationships(
      createdRole.id,
      createRoleDto.permissions,
      req,
    );

    return createdRole;
  }

  async getAllRoles(
    filterDto: FilterRoleDto,
  ): Promise<PaginatedResponse<RoleEntity>> {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      role_code,
      role_name,
      start_date,
      end_date,
    } = filterDto;
    const skip = (page - 1) * limit;

    const where = this.buildRoleFilterWhere(
      role_code,
      role_name,
      start_date,
      end_date,
    );

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          role_code: true,
          role_name: true,
          created_by: { select: { full_name: true } },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      items: roles.map((role) => new RoleEntity(role)),
      total,
      page,
      limit,
    };
  }

  async getRoleById(id: string): Promise<RoleEntity> {
    const role = await this.prisma.role.findUnique({
      where: { id: id },
      include: {
        created_by: { select: { full_name: true, email: true } },
        updated_by: { select: { full_name: true, email: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('Role does not exist');
    }

    return new RoleEntity(role);
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
    req: Request,
  ): Promise<Role> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingRole = await this.prisma.role.findFirst({
      where: {
        role_code: updateRoleDto.role_code,
        id: { not: id },
        status: { not: Status.DELETE },
      },
    });
    let updatedRole: Role;
    if (existingRole) {
      throw new BadRequestException(
        `Role with code '${updateRoleDto.role_code}' already exists`,
      );
    } else {
      updatedRole = await this.prisma.role.update({
        where: { id: id },
        data: {
          role_code: updateRoleDto.role_code,
          role_name: updateRoleDto.role_name,
          ...(updateRoleDto.permissions && {
            permissions: JSON.parse(JSON.stringify(updateRoleDto.permissions)),
          }),
          updated_by: { connect: { id: currentUser.id } },
        },
      });
    }

    if (updateRoleDto.permissions) {
      await this.updateRolePermissionRelationships(
        id,
        updateRoleDto.permissions,
        req,
      );
    }

    return updatedRole;
  }

  async deleteRole(id: string, req: Request): Promise<Role> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    // Check if role exists and is not already deleted
    const existingRole = await this.prisma.role.findFirst({
      where: { id: id, status: { not: Status.DELETE } },
    });

    if (!existingRole) {
      throw new NotFoundException('Role does not exist');
    }

    // Soft delete role permissions
    await this.prisma.rolePermission.deleteMany({
      where: {
        role_id: id,
      },
    });

    // Soft delete the role
    const deletedRole = await this.prisma.role.update({
      where: { id: id },
      data: {
        status: Status.DELETE,
        deleted_at: new Date(),
        updated_by_id: currentUser.id,
        deleted_by_id: currentUser.id,
      },
    });

    return deletedRole;
  }

  async getCommonRoles(): Promise<{ role_code: string; role_name: string }[]> {
    return this.prisma.role.findMany({
      where: { role_code: { not: 'SYS_ADMIN' }, status: { not: Status.DELETE } },
      select: { role_code: true, role_name: true },
    });
  }

  async getRoleByCode(role_code: string): Promise<Role> {
    const role = await this.prisma.role.findFirst({
      where: { role_code, deleted_at: null },
    });

    if (!role) {
      throw new NotFoundException(`Role with code ${role_code} not found`);
    }

    return role;
  }

  async findRoleIdByCode(role_code: string): Promise<string> {
    const role = await this.prisma.role.findFirst({
      where: { role_code, deleted_at: null },
      select: { id: true },
    });

    return role?.id || '';
  }

  async getRolePermissions(roleId: string): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return {
      roleId,
      permissions: role.permissions,
    };
  }

  private async createRolePermissionRelationships(
    roleId: string,
    permissions: PermissionDto[],
    req: Request,
  ): Promise<void> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const permissionNames = this.extractPermissionNames(permissions);

    for (const permissionName of permissionNames) {
      try {
        const permission =
          await this.permissionService.getPermissionByName(permissionName);

        const existingRolePermission =
          await this.prisma.rolePermission.findFirst({
            where: {
              role_id: roleId,
              permission_id: permission.id,
            },
          });

        if (
          existingRolePermission &&
          existingRolePermission.status !== Status.DELETE
        ) {
          throw new BadRequestException(
            `Role permission with permission '${permissionName}' already exists`,
          );
        } else {
          await this.createRolePermission(
            roleId,
            permission.id,
            currentUser.id,
          );
        }
        // If it exists and is active, do nothing (avoid duplicate)
      } catch (error: any) {
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }
  }

  private async updateRolePermissionRelationships(
    roleId: string,
    permissions: PermissionDto[],
    req: Request,
  ): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: { role_id: roleId },
    });
    await this.createRolePermissionRelationships(roleId, permissions, req);
  }

  private async createRolePermission(
    roleId: string,
    permissionId: string,
    userId: string,
  ) {
    return await this.prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permission_id: permissionId,
        created_by_id: userId,
      },
    });
  }

  private extractPermissionNames(permissions: PermissionDto[]): string[] {
    const permissionNames: string[] = [];

    for (const permission of permissions) {
      if (permission.menuName && permission.actions) {
        const moduleName = permission.menuName.toLowerCase().replace(/ /g, '-');
        this.addModulePermissions(
          permissionNames,
          moduleName,
          permission.actions,
        );
      }

      if (permission.subMenus && Array.isArray(permission.subMenus)) {
        for (const subMenu of permission.subMenus) {
          if (subMenu.menuName && subMenu.actions) {
            const subModuleName = subMenu.menuName
              .toLowerCase()
              .replace(/ /g, '-');
            this.addModulePermissions(
              permissionNames,
              subModuleName,
              subMenu.actions,
            );
          }
        }
      }
    }
    return permissionNames;
  }

  private addModulePermissions(
    permissionNames: string[],
    moduleName: string,
    actions: {
      create: boolean;
      read: boolean;
      edit: boolean;
      delete: boolean;
      list: boolean;
    },
  ): void {
    const availableActions = ['create', 'read', 'edit', 'delete', 'list'];

    availableActions.forEach((action) => {
      if (actions[action] === true) {
        permissionNames.push(`${moduleName}:${action}`);
      }
    });
  }

  private buildRoleFilterWhere(
    role_code?: string,
    role_name?: string,
    start_date?: string,
    end_date?: string,
  ): Prisma.RoleWhereInput {
    const where: Prisma.RoleWhereInput = {
      status: { not: Status.DELETE },
      ...(role_code && {
        role_code: { contains: role_code, mode: 'insensitive' },
      }),
      ...(role_name && {
        role_name: { contains: role_name, mode: 'insensitive' },
      }),
    };

    if (start_date || end_date) {
      const parsedStart = start_date ? new Date(start_date) : null;
      const parsedEnd = end_date ? new Date(end_date) : null;

      this.validateDateRange(parsedStart, parsedEnd);

      where.created_at = {
        ...(parsedStart && { gte: new Date(parsedStart.setHours(0, 0, 0, 0)) }),
        ...(parsedEnd && {
          lte: new Date(parsedEnd.setHours(23, 59, 59, 999)),
        }),
      };
    }

    return where;
  }

  private validateDateRange(
    parsedStart: Date | null,
    parsedEnd: Date | null,
  ): void {
    if (parsedStart && isNaN(parsedStart.getTime())) {
      throw new BadRequestException(
        'Invalid startDate format. Expected YYYY-MM-DD.',
      );
    }
    if (parsedEnd && isNaN(parsedEnd.getTime())) {
      throw new BadRequestException(
        'Invalid endDate format. Expected YYYY-MM-DD.',
      );
    }
  }
}
