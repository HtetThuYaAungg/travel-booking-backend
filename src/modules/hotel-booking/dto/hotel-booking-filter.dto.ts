import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class HotelBookingFilterDto {
  @ApiProperty({ description: 'Search by customer name', required: false })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiProperty({ description: 'Search by customer email', required: false })
  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @ApiProperty({ description: 'Filter by hotel ID', required: false })
  @IsString()
  @IsOptional()
  hotel_id?: string;

  @ApiProperty({ description: 'Filter by check-in date (from)', required: false })
  @IsDateString()
  @IsOptional()
  check_in_date_from?: string;

  @ApiProperty({ description: 'Filter by check-in date (to)', required: false })
  @IsDateString()
  @IsOptional()
  check_in_date_to?: string;

  @ApiProperty({ description: 'Filter by check-out date (from)', required: false })
  @IsDateString()
  @IsOptional()
  check_out_date_from?: string;

  @ApiProperty({ description: 'Filter by check-out date (to)', required: false })
  @IsDateString()
  @IsOptional()
  check_out_date_to?: string;

  @ApiProperty({ description: 'Filter by minimum number of guests', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  min_guests?: number;

  @ApiProperty({ description: 'Filter by maximum number of guests', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  max_guests?: number;

  @ApiProperty({ description: 'Filter by minimum number of rooms', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  min_rooms?: number;

  @ApiProperty({ description: 'Filter by maximum number of rooms', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  max_rooms?: number;

  @ApiProperty({ description: 'Page number', minimum: 1, default: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', minimum: 1, maximum: 100, default: 10, required: false })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({ description: 'Sort field', required: false })
  @IsString()
  @IsOptional()
  sort_by?: string = 'created_at';

  @ApiProperty({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc', required: false })
  @IsString()
  @IsOptional()
  sort_order?: 'asc' | 'desc' = 'desc';
}
