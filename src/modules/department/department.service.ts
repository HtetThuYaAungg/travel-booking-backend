import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Department, Prisma, Status } from '@prisma/client'; // Import Prisma model
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { FilterDepartmentDto } from './dto/filter-department-dto';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/utils/constants';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
    req: any,
  ): Promise<Department> {
    try {
      const currentUser = await this.userService.getAuthenticatedUser(req);
      const existingDepartment = await this.prisma.department.findFirst({
        where: {
          department_code: createDepartmentDto.department_code,
          deleted_at: null,
        },
      });
      let createdDepartment: Department;
      if (existingDepartment) {
        throw new BadRequestException(
          `Department with code '${createDepartmentDto.department_code}' already exists`,
        );
      } else {
        createdDepartment = await this.prisma.department.create({
          data: {
            ...createDepartmentDto,
            created_by: { connect: { id: currentUser.id } },
          },
        });
      }

      return createdDepartment;
    } catch (error) {
      throw error;
    }
  }

  async getAllDepartments(
    filterDto: FilterDepartmentDto,
  ): Promise<PaginatedResponse<Department>> {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      department_code,
      department_name,
      start_date,
      end_date,
    } = filterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {
      status: { not: Status.DELETE },
      ...(department_code && {
        department_code: { contains: department_code, mode: 'insensitive' },
      }),
      ...(department_name && {
        department_name: { contains: department_name, mode: 'insensitive' },
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

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          created_by: { select: { full_name: true, email: true } },
          updated_by: { select: { full_name: true, email: true } },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    return { items: departments, total, page, limit };
  }

  async getCommonDepartments(): Promise<
    { department_code: string; department_name: string }[]
  > {
    return this.prisma.department.findMany({
      where: {
        department_code: { not: 'SYS001' },
        status: { not: Status.DELETE },
      },
      select: { department_code: true, department_name: true },
    });
  }

  async getDepartmentById(id: string): Promise<Department> {
    const department = await this.prisma.department.findFirst({
      where: { id: id, deleted_at: null },
      include: {
        created_by: { select: { full_name: true, email: true } },
        updated_by: { select: { full_name: true, email: true } },
      },
    });

    if (!department) {
      throw new NotFoundException('Department does not exist');
    }

    return department;
  }

  async getDepartmentByCode(department_code: string): Promise<Department> {
    const department = await this.prisma.department.findFirst({
      where: { department_code, deleted_at: null },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with code : ${department_code} does not exist`,
      );
    }

    return department;
  }

  async findDepartmentIdByCode(department_code: string): Promise<string> {
    const department = await this.prisma.department.findFirst({
      where: { department_code, deleted_at: null },
      select: { id: true },
    });

    return department?.id ?? '';
  }

  async updateDepartment(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    req: any,
  ): Promise<Department> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingDepartment = await this.prisma.department.findFirst({
      where: {
        department_code: updateDepartmentDto.department_code,
        id: { not: id },
        deleted_at: null,
      },
    });

    let updatedDepartment: Department;
    if (existingDepartment) {
      throw new BadRequestException(
        `Department with code '${updateDepartmentDto.department_code}' already exists`,
      );
    } else {
      updatedDepartment = await this.prisma.department.update({
        where: { id: id },
        data: {
          department_code: updateDepartmentDto.department_code,
          department_name: updateDepartmentDto.department_name,
          updated_by: { connect: { id: currentUser.id } },
        },
      });
    }
    return updatedDepartment;
  }

  async deleteDepartment(id: string, req: any): Promise<Department> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingDepartment = await this.prisma.department.findFirst({
      where: { id: id, deleted_at: null },
    });
    if (!existingDepartment) {
      throw new NotFoundException('Department does not exist');
    }
    const deletedDepartment = await this.prisma.department.update({
      where: { id: id },
      data: {
        status: Status.DELETE,
        deleted_at: new Date(),
        updated_by: { connect: { id: currentUser.id } },
        deleted_by: { connect: { id: currentUser.id } },
      },
    });

    return deletedDepartment;
  }
}
