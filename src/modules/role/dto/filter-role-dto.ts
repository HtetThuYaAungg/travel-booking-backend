import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterRoleDto {
  @IsOptional()
  @IsString()
  role_name?: string;

  @IsOptional()
  @IsString()
  role_code?: string;


  @IsOptional()
  @IsDateString()
  start_date?: string; 

  @IsOptional()
  @IsDateString()
  end_date?: string; 

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}