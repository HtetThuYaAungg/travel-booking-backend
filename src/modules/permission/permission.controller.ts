import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FilterPermissionDto } from './dto/filter-permission-dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';

@ApiTags('Permission')
@Controller('permission')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('new')
  @Permission('permissions:create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  create(@Body() createPermissionDto: CreatePermissionDto, @Request() req) {
    return this.permissionService.createPermission(createPermissionDto, req);
  }

  @Get('all')
  @Permission('permissions:list')
  @ApiOperation({ summary: 'Get all permissions with pagination' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  findAll(@Query() filterDto: FilterPermissionDto) {
    return this.permissionService.getAllPermissions(filterDto);
  }

  @Get('modules')
  @Permission('permissions:list')
  @ApiOperation({ summary: 'Get all modules' })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully' })
  getAllModules() {
    return this.permissionService.getAllModules();
  }

  @Get('module/:module')
  @Permission('permissions:list')
  @ApiOperation({ summary: 'Get permissions by module' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  getPermissionsByModule(@Param('module') module: string) {
    return this.permissionService.getPermissionsByModule(module);
  }

  @Get(':id')
  @Permission('permissions:read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.permissionService.getPermissionById(id);
  }

  @Patch(':id')
  @Permission('permissions:edit')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Request() req,
  ) {
    return this.permissionService.updatePermission(
      id,
      updatePermissionDto,
      req,
    );
  }

  @Delete(':id')
  @Permission('permissions:delete')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.permissionService.deletePermission(id, req);
  }
} 