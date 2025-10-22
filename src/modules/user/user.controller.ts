import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { FilterUserDto } from './dto/filter-user-dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/common/decorators/public';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';
import { JsonValue } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refreshing new token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access new refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { accessToken, refreshToken } =
      await this.userService.refreshToken(refreshTokenDto);
    const envMode = process.env.NODE_ENV?.trim();

    res.cookie(`access_token_${envMode}`, accessToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain:
        envMode === 'production' ? '.example.com' : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.cookie(`refresh_token_${envMode}`, refreshToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain:
        envMode === 'production' ? '.example.com' : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });
    return { message: 'Get Refresh Token Successfully' };
  }

  @Post('register')
  @Permission('users:create')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<User> {
    return await this.userService.register(createUserDto, req);
  }

  @Get('/permissions')
  @ApiOperation({ summary: 'Get user permission by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User Permissions',
  })
  async getUserPermissions(@Req() req: Request): Promise<JsonValue> {
    return this.userService.getUserPermissions(req);
  }

  @Get('all')
  @Permission('users:list')
  @ApiOperation({ summary: 'Get all users with filters' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiQuery({ name: 'full_name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'staff_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'department_code', required: false })
  @ApiQuery({ name: 'role_code', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllUsers(
    @Query() filterUserDto: FilterUserDto,
  ): Promise<PaginatedResponse<User>> {
    return this.userService.getAllUsers(filterUserDto);
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get a user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User Profile',
  })
  async getCurrentUserProfile(@Req() req: Request): Promise<User> {
    return this.userService.getCurrentUserProfile(req);
  }

  @Post('/me/change-password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    return this.userService.changePassword(changePasswordDto, req);
  }

  @Get(':id')
  @Permission('users:read')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details',
  })
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @Permission('users:edit')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto, req);
  }

  @Delete(':id')
  @Permission('users:delete')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  async deleteUser(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<User> {
    return this.userService.deleteUser(id, req);
  }
}
