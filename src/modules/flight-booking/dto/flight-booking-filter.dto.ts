import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class FlightBookingFilterDto {
  @ApiProperty({ required: false, description: 'Search by booking reference, customer name, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Booking reference' })
  @IsOptional()
  @IsString()
  booking_reference?: string;

  @ApiProperty({ required: false, description: 'Customer name' })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiProperty({ required: false, description: 'Customer email' })
  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @ApiProperty({ required: false, description: 'Flight ID' })
  @IsOptional()
  @IsString()
  flight_id?: string;

  @ApiProperty({ required: false, description: 'User ID' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ required: false, description: 'Departure date (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  departure_date?: string;

  @ApiProperty({ required: false, description: 'Return date (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  return_date?: string;

  @ApiProperty({ required: false, description: 'Minimum total price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  min_price?: number;

  @ApiProperty({ required: false, description: 'Maximum total price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  max_price?: number;

  @ApiProperty({ required: false, description: 'Booking status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'Payment status' })
  @IsOptional()
  @IsString()
  payment_status?: string;

  @ApiProperty({ required: false, description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, description: 'Is round trip' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_round_trip?: boolean;

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
  sort_by?: string = 'created_at';

  @ApiProperty({ required: false, description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc' = 'desc';
}
