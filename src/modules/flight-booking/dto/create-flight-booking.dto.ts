import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray, IsNumber, IsDateString, Min, Max, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class PassengerDto {
  @ApiProperty({ description: 'Passenger full name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ description: 'Passenger age' })
  @IsNumber()
  @Min(0)
  @Max(120)
  age: number;

  @ApiProperty({ description: 'Passenger type', enum: ['adult', 'child', 'infant'] })
  @IsString()
  @IsNotEmpty()
  type: 'adult' | 'child' | 'infant';

  @ApiProperty({ description: 'Seat preference', required: false })
  @IsString()
  @IsOptional()
  seat_preference?: string;

  @ApiProperty({ description: 'Meal preference', required: false })
  @IsString()
  @IsOptional()
  meal_preference?: string;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  special_requests?: string;
}

export class CreateFlightBookingDto {
  @ApiProperty({ description: 'Flight ID' })
  @IsString()
  @IsNotEmpty()
  flight_id: string;

  @ApiProperty({ description: 'Customer full name' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  @IsNotEmpty()
  customer_email: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsString()
  @IsOptional()
  customer_phone?: string;

  @ApiProperty({ description: 'Array of passengers', type: [PassengerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];

  @ApiProperty({ description: 'Departure date (ISO 8601 format)' })
  @IsDateString()
  @IsNotEmpty()
  departure_date: string;

  @ApiProperty({ description: 'Return date for round-trip flights', required: false })
  @IsDateString()
  @IsOptional()
  return_date?: string;

  @ApiProperty({ description: 'Base price' })
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiProperty({ description: 'Taxes and fees', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxes_fees?: number = 0;

  @ApiProperty({ description: 'Discounts applied', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discounts?: number = 0;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Seat preferences', required: false })
  @IsArray()
  @IsOptional()
  seat_preferences?: string[];

  @ApiProperty({ description: 'Meal preferences', required: false })
  @IsArray()
  @IsOptional()
  meal_preferences?: string[];

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  special_requests?: string;

  @ApiProperty({ description: 'Payment status', default: 'PENDING' })
  @IsString()
  @IsOptional()
  payment_status?: string = 'PENDING';
}
