import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';

class PermissionActionDto {
  @IsNotEmpty()
  create: boolean;

  @IsNotEmpty()
  read: boolean;

  @IsNotEmpty()
  edit: boolean;

  @IsNotEmpty()
  delete: boolean;

  @IsNotEmpty()
  list: boolean;
}

class SubMenuDto {
  @IsNotEmpty()
  @IsString()
  menuName: string;

  @IsNotEmpty()
  actions: PermissionActionDto;
}

export class PermissionDto {
  @IsNotEmpty()
  @IsString()
  menuName: string;

  @Optional()
  @ValidateNested({ each: true })
  @Type(() => SubMenuDto)
  subMenus?: SubMenuDto[];

  @Optional()
  actions?: PermissionActionDto;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'ROLE001' })
  @IsNotEmpty()
  @IsString()
  role_code: string;

  @ApiProperty({ example: 'Administrator' })
  @IsNotEmpty()
  @IsString()
  role_name: string;

  @ApiProperty({
    type: [PermissionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
