import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';


export class CreateDepartmentDto {
  @ApiProperty({ example: 'IT' })
  @IsNotEmpty()
  @IsString()
  department_code: string;

  @ApiProperty({ example: 'Information Technology' })
  @IsNotEmpty()
  @IsString()
  department_name: string;

}
