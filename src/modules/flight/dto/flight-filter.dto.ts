import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FlightFilterDto {
  @ApiProperty({ required: false, description: 'Search by flight number, airline name, or airport codes' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Departure airport code' })
  @IsOptional()
  @IsString()
  departure_airport_code?: string;

  @ApiProperty({ required: false, description: 'Arrival airport code' })
  @IsOptional()
  @IsString()
  arrival_airport_code?: string;

  @ApiProperty({ required: false, description: 'Departure city' })
  @IsOptional()
  @IsString()
  departure_city?: string;

  @ApiProperty({ required: false, description: 'Arrival city' })
  @IsOptional()
  @IsString()
  arrival_city?: string;

  @ApiProperty({ required: false, description: 'Airline name' })
  @IsOptional()
  @IsString()
  airline_name?: string;

  @ApiProperty({ required: false, description: 'Airline code' })
  @IsOptional()
  @IsString()
  airline_code?: string;

  @ApiProperty({ required: false, description: 'Departure date (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  departure_date?: string;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  min_price?: number;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  max_price?: number;

  @ApiProperty({ required: false, description: 'Flight class type' })
  @IsOptional()
  @IsString()
  class_type?: string;

  @ApiProperty({ required: false, description: 'Has WiFi' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  has_wifi?: boolean;

  @ApiProperty({ required: false, description: 'Has meal service' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  has_meal?: boolean;

  @ApiProperty({ required: false, description: 'Is domestic flight' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_domestic?: boolean;

  @ApiProperty({ required: false, description: 'Minimum available seats' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  min_available_seats?: number;

  @ApiProperty({ required: false, description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Sort field' })
  @IsOptional()
  @IsString()
  sort_by?: string = 'departure_time';

  @ApiProperty({ required: false, description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc' = 'asc';
}
