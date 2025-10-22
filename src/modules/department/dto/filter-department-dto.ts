import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class FilterDepartmentDto {
  @IsOptional()
  @IsString()
  department_name?: string;

  @IsOptional()
  @IsString()
  department_code?: string;


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