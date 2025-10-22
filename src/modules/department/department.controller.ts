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
} from '@nestjs/common';

import { Request } from 'express';

import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { FilterDepartmentDto } from './dto/filter-department-dto';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { Department } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';

@ApiTags('Department')
@Controller('department')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('new')
  @Permission('departments:create')
  @ApiOperation({ summary: 'Create a new Department' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department created successfully',
  })
  async register(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Req() req: Request,
  ): Promise<any> {
    const result = await this.departmentService.createDepartment(
      createDepartmentDto,
      req,
    );
    return result;
  }

  @Get('all')
  @Permission('departments:list')
  @ApiOperation({ summary: 'Get all departments with filters' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  @ApiQuery({ name: 'department_name', required: false })
  @ApiQuery({ name: 'department_code', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllDepartments(
    @Query() filterDepartmentDto: FilterDepartmentDto,
  ): Promise<PaginatedResponse<Department>> {
    return this.departmentService.getAllDepartments(filterDepartmentDto);
  }

  @Get('common/all')
  @Permission('departments:list')
  @ApiOperation({ summary: 'Get all common departments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List common of Department',
  })
  async getCommonDepartments(): Promise<
    { department_code: string; department_name: string }[]
  > {
    return this.departmentService.getCommonDepartments();
  }

  @Get(':id')
  @Permission('departments:read')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Department details' })
  async getDepartmentById(@Param('id') id: string): Promise<Department> {
    return this.departmentService.getDepartmentById(id);
  }

  @Patch(':id')
  @Permission('departments:edit')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department updated successfully',
  })
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Req() req: Request,
  ): Promise<Department> {
    return this.departmentService.updateDepartment(
      id,
      updateDepartmentDto,
      req,
    );
  }

  @Delete(':id')
  @Permission('departments:delete')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department deleted successfully',
  })
  async deleteDepartment(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Department> {
    return this.departmentService.deleteDepartment(id, req);
  }
}
