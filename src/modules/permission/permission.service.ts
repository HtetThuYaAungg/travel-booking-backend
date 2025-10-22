import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FilterPermissionDto } from './dto/filter-permission-dto';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { Permission, Prisma, Status } from '@prisma/client';
import { UserService } from '../user/user.service';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/utils/constants';
import { capitalize } from 'src/common/utils/helper';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createPermission(
    createPermissionDto: CreatePermissionDto,
    req: any,
  ): Promise<Permission> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        module: createPermissionDto.module,
        action: createPermissionDto.action,
        deleted_at: null,
      },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `Permission with module '${createPermissionDto.module}' and action '${createPermissionDto.action}' already exists`,
      );
    }
    const createdPermission = await this.prisma.permission.create({
      data: {
        module: createPermissionDto.module?.toLocaleLowerCase(),
        action: createPermissionDto.action?.toLocaleLowerCase(),
        description:
          createPermissionDto.description ||
          capitalize(createPermissionDto.action) +
            ' ' +
            capitalize(createPermissionDto.module),
        name: `${createPermissionDto.module?.toLocaleLowerCase()}:${createPermissionDto.action?.toLocaleLowerCase()}`,
        created_by: { connect: { id: currentUser.id } },
      },
    });

    return createdPermission;
  }

  async getAllPermissions(
    filterDto: FilterPermissionDto,
  ): Promise<PaginatedResponse<Permission>> {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      name,
      module,
      action,
      start_date,
      end_date,
    } = filterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.PermissionWhereInput = {
      status: { not: Status.DELETE },
      ...(name && {
        name: { contains: name, mode: 'insensitive' },
      }),
      ...(module && {
        module: { contains: module, mode: 'insensitive' },
      }),
      ...(action && {
        action: { contains: action, mode: 'insensitive' },
      }),
    };

    if (start_date || end_date) {
      const parsedStart = start_date ? new Date(start_date) : null;
      const parsedEnd = end_date ? new Date(end_date) : null;

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

      where.created_at = {
        ...(parsedStart && { gte: new Date(parsedStart.setHours(0, 0, 0, 0)) }),
        ...(parsedEnd && {
          lte: new Date(parsedEnd.setHours(23, 59, 59, 999)),
        }),
      };
    }

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          created_by: { select: { full_name: true, email: true } },
          updated_by: { select: { full_name: true, email: true } },
        },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return { items: permissions, total, page, limit };
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findFirst({
      where: { id: id, deleted_at: null },
      include: {
        created_by: { select: { full_name: true, email: true } },
        updated_by: { select: { full_name: true, email: true } },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission does not exist');
    }

    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission> {
    const permission = await this.prisma.permission.findFirst({
      where: { name, deleted_at: null },
    });

    if (!permission) {
      throw new NotFoundException('Permission does not exist');
    }

    return permission;
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    req: any,
  ): Promise<Permission> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        module: updatePermissionDto.module,
        action: updatePermissionDto.action,
        id: { not: id },
        deleted_at: null,
      },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `Permission with module '${updatePermissionDto.module}' and action '${updatePermissionDto.action}' already exists`,
      );
    }
    const updatedPermission = await this.prisma.permission.update({
      where: { id: id },
      data: {
        module: updatePermissionDto.module?.toLocaleLowerCase(),
        action: updatePermissionDto.action?.toLocaleLowerCase(),
        description:
          updatePermissionDto.description ||
          capitalize(updatePermissionDto.action) +
            ' ' +
            capitalize(updatePermissionDto.module),  
        name: `${updatePermissionDto.module?.toLocaleLowerCase()}:${updatePermissionDto.action?.toLocaleLowerCase()}`,
        updated_by: { connect: { id: currentUser.id } },
      },
    });

    return updatedPermission;
  }

  async deletePermission(id: string, req: any): Promise<Permission> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingPermission = await this.prisma.permission.findFirst({
      where: { id: id, deleted_at: null },
    });
    if (!existingPermission) {
      throw new NotFoundException('Permission does not exist');
    }
    const deletedPermission = await this.prisma.permission.update({
      where: { id: id },
      data: {
        status: Status.DELETE,
        deleted_at: new Date(),
        updated_by: {
          connect: { id: currentUser.id },
        },
        deleted_by: {
          connect: { id: currentUser.id },
        },
      },
    });
    return deletedPermission;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            role_permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) {
      return [];
    }

    return user.role.role_permissions
      .filter(
        (rp) => rp.status === 'ACTIVE' && rp.permission.status === 'ACTIVE',
      )
      .map((rp) => rp.permission.name);
  }

  async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permissionName);
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { module, status: { not: Status.DELETE } },
      orderBy: { name: 'asc' },
    });
  }

  async getAllModules(): Promise<string[]> {
    const modules = await this.prisma.permission.findMany({
      where: { status: { not: Status.DELETE } },
      select: { module: true },
      distinct: ['module'],
    });
    return modules.map((m) => m.module);
  }
}
