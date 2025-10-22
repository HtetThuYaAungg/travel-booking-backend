import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user-dto';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';
import { RoleService } from '../role/role.service';
import { DepartmentService } from '../department/department.service';
import { PrismaService } from '../prisma/prisma.service';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  Department,
  Prisma,
  Role,
  Status,
  User,
  UserType,
} from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DEFAULT_LIMIT } from 'src/common/utils/constants';
import { DEFAULT_PAGE } from 'src/common/utils/constants';
import { connect } from 'http2';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => RoleService))
    private readonly roleService: RoleService,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto, req: any): Promise<User> {
    const {
      email,
      staff_id,
      password,
      confirm_password,
      role_code,
      department_code,
    } = createUserDto;

    const loginUser = await this.getAuthenticatedUser(req);
    await this.validateUserRegistration(
      staff_id,
      email,
      password,
      confirm_password,
    );

    const existRole = await this.roleService.getRoleByCode(role_code);
    const existDepartment =
      await this.departmentService.getDepartmentByCode(department_code);

    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.createUser(
      createUserDto,
      hashedPassword,
      loginUser,
      existRole,
      existDepartment,
    );

    return newUser;
  }

  async getAllUsers(
    filterUserDto: FilterUserDto,
  ): Promise<PaginatedResponse<User>> {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      full_name,
      email,
      staff_id,
      status,
      department_code,
      role_code,
      start_date,
      end_date,
    } = filterUserDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      status: { not: Status.DELETE },
      ...(full_name && {
        full_name: { contains: full_name, mode: 'insensitive' },
      }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(staff_id && { staff_id }),
      ...(status && { status }),

      ...(department_code && {
        department: {
          id: await this.departmentService.findDepartmentIdByCode(
            department_code,
          ),
        },
      }),

      ...(role_code && {
        role: {
          id: await this.roleService.findRoleIdByCode(role_code),
        },
      }),
    };

    if (start_date || end_date) {
      const parsedStartDate = start_date ? new Date(start_date) : null;
      const parsedEndDate = end_date ? new Date(end_date) : null;

      if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
        throw new BadRequestException(
          'Invalid start_date format. Expected YYYY-MM-DD.',
        );
      }
      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException(
          'Invalid end_date format. Expected YYYY-MM-DD.',
        );
      }

      where.created_at = {
        ...(parsedStartDate && {
          gte: new Date(parsedStartDate.setHours(0, 0, 0, 0)),
        }),
        ...(parsedEndDate && {
          lte: new Date(parsedEndDate.setHours(23, 59, 59, 999)),
        }),
      };
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          role: true,
          department: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      items: users.map((user) => new UserEntity(user)),
      total,
      page,
      limit,
    };
  }

  async getUserPermissions(req: any): Promise<JsonValue> {
    const currentUser = await this.getAuthenticatedUser(req);

    const user = await this.prismaService.user.findUnique({
      where: { id: currentUser.id, status: { not: Status.DELETE } },
      include: {
        role: {
          select: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.role) {
      throw new NotFoundException('User or role not found');
    }

    return user.role.permissions;
  }

  async getCurrentUserProfile(req: any): Promise<User> {
    const currentUser = await this.getAuthenticatedUser(req);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: currentUser.id,
        status: { not: Status.DELETE },
      },
      include: {
        role: true,
        department: true,
        created_by: { select: { full_name: true, email: true } },
        updated_by: { select: { full_name: true, email: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserEntity(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
      include: {
        role: true,
        department: true,
        created_by: { select: { full_name: true, email: true } },
        updated_by: { select: { full_name: true, email: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return new UserEntity(user);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    req: any,
  ): Promise<User> {
    const {
      email,
      staff_id,
      user_type,
      password,
      full_name,
      confirm_password,
      role_code,
      department_code,
      status,
    } = updateUserDto;
    const currentUser = await this.getAuthenticatedUser(req);

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    const existRole = await this.roleService.getRoleByCode(role_code || '');
    const existDepartment = await this.departmentService.getDepartmentByCode(
      department_code || '',
    );

    const existingEmailUser = await this.prismaService.user.findFirst({
      where: {
        email: email,
        id: { not: id },
        deleted_at: null,
      },
    });

    const existingStaffIdUser = await this.prismaService.user.findFirst({
      where: {
        staff_id: staff_id,
        id: { not: id },
        deleted_at: null,
      },
    });

    if (existingEmailUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (existingStaffIdUser) {
      throw new BadRequestException('User with this staff ID already exists');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: {
        email: email,
        full_name: full_name,
        staff_id: staff_id,
        department_id: existDepartment.id,
        role_id: existRole.id,
        user_type: user_type || UserType.MAKER,
        status: status || Status.ACTIVE,
        updated_by_id: currentUser.id,
        password: updateUserDto.password,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string, req: any): Promise<User> {
    const currentUser = await this.getAuthenticatedUser(req);
    const existingUser = await this.prismaService.user.findFirst({
      where: { id: id, deleted_at: null },
    });
    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    const deletedUser = await this.prismaService.user.update({
      where: { id: id },
      data: {
        status: Status.DELETE,
        deleted_at: new Date(),
        updated_by: { connect: { id: currentUser.id } },
        deleted_by: { connect: { id: currentUser.id } },
      },
    });

    return deletedUser;
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    req: any,
  ): Promise<{ message: string }> {
    const { current_password, new_password, confirm_new_password } =
      changePasswordDto;
    const currentUser = await this.getAuthenticatedUser(req);
    if (new_password !== confirm_new_password) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }
    await this.verifyPassword(currentUser.password, current_password);
    const hashedNewPassword = await this.hashPassword(new_password);
    await this.prismaService.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedNewPassword,
        updated_by: { connect: { id: currentUser.id } },
      },
    });

    return { message: 'Password changed successfully' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      const user = await this.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  public async findUserByEmail(email: string): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        status: { not: Status.DELETE },
      },
    });
    if (!user) {
      throw new BadRequestException('Check your email or password');
    }
    return user;
  }

  public async findUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { id: id, deleted_at: null },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid User!');
    }
    return user;
  }

  public async verifyPassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) throw new BadRequestException('Check your email or password');
  }

  public async getAuthenticatedUser(req: any): Promise<User> {
    if (!req.user)
      throw new UnauthorizedException('Missing authentication token');
    const user = await this.prismaService.user.findFirst({
      where: { id: req.user.sub, deleted_at: null },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private async validateUserRegistration(
    staff_id: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<void> {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match!');
    }

    const existingEmailUser = await this.prismaService.user.findFirst({
      where: {
        email: email,
        deleted_at: null,
      },
    });

    const existingStaffIdUser = await this.prismaService.user.findFirst({
      where: {
        staff_id: staff_id,
        deleted_at: null,
      },
    });

    if (existingEmailUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (existingStaffIdUser) {
      throw new BadRequestException('User with this staff ID already exists');
    }
  }

  private async createUser(
    createUserDto: CreateUserDto,
    hashedPassword: string,
    currentUser: User,
    role: Role,
    department: Department,
  ) {
    const {
      confirm_password,
      department_code,
      role_code,
      ...dataWithoutConfirm
    } = createUserDto;
    return this.prismaService.user.create({
      data: {
        ...dataWithoutConfirm,
        password: hashedPassword,
        role_id: role.id,
        department_id: department.id,
        created_by_id: currentUser.id,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.full_name,
      status: user.status,
    };

    const payloadForRefresh = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_IN'),
    });

    const refreshToken = this.jwtService.sign(payloadForRefresh, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE_IN'),
    });

    return { accessToken, refreshToken };
  }
}
