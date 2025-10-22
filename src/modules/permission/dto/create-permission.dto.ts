import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create users',
    description: 'Permission description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'users', description: 'Module name' })
  @IsNotEmpty()
  @IsString()
  module: string;

  @ApiProperty({ example: 'create', description: 'Action name' })
  @IsNotEmpty()
  @IsString()
  action: string;
}
