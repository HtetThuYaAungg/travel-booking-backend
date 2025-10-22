import { Status } from '@prisma/client';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  staff_id?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  department_code?: string;

  @IsOptional()
  @IsString()
  role_code?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string; // ISO date string (e.g., '2023-01-01')

  @IsOptional()
  @IsDateString()
  end_date?: string; // ISO date string (e.g., '2023-12-31')

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}