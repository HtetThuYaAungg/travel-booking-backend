import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Patch,
  HttpStatus,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';

import { Request } from 'express';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterRoleDto } from './dto/filter-role-dto';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { Role } from '@prisma/client';
import { RoleEntity } from './entities/role.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';

@ApiTags('Role')
@Controller('role')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('new')
  @Permission('roles:create')
  @ApiOperation({ summary: 'Create a new Role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
    type: RoleEntity,
  })
  async register(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: Request,
  ): Promise<RoleEntity> {
    const result = await this.roleService.createRole(createRoleDto, req);
    return new RoleEntity(result);
  }

  @Get('all')
  @Permission('roles:list')
  @ApiOperation({ summary: 'Get all roles with filters' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiQuery({ name: 'role_name', required: false })
  @ApiQuery({ name: 'role_code', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllRoles(
    @Query() filterRoleDto: FilterRoleDto,
  ): Promise<PaginatedResponse<RoleEntity>> {
    return this.roleService.getAllRoles(filterRoleDto);
  }

  @Get('common/all')
  @Permission('roles:list')
  @ApiOperation({ summary: 'Get all common roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List common of roles',
  })
  async getCommonRoles(): Promise<{ role_code: string; role_name: string }[]> {
    return this.roleService.getCommonRoles();
  }

  @Get(':id')
  @Permission('roles:read')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role details',
  })
  async getRoleById(@Param('id') id: string): Promise<RoleEntity> {
    return this.roleService.getRoleById(id);
  }

  @Patch(':id')
  @Permission('roles:edit')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
  })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: Request,
  ): Promise<Role> {
    return this.roleService.updateRole(id, updateRoleDto, req);
  }

  @Delete(':id')
  @Permission('roles:delete')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted successfully',
  })
  async deleteRole(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Role> {
    return this.roleService.deleteRole(id, req);
  }

  @Get(':id/permissions')
  @Permission('roles:read')
  @ApiOperation({ summary: 'Get permissions for a role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role permissions retrieved successfully',
  })
  async getRolePermissions(
    @Param('id') id: string,
  ): Promise<any> {
    return this.roleService.getRolePermissions(id);
  }
}
