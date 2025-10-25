import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsDateString, IsNumber, Min } from 'class-validator';
import { CreateHotelBookingDto } from './create-hotel-booking.dto';

export class UpdateHotelBookingDto extends PartialType(CreateHotelBookingDto) {
  @ApiProperty({ description: 'Customer name', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ description: 'Customer email', required: false })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Check-in date', required: false })
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @ApiProperty({ description: 'Check-out date', required: false })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  guests?: number;

  @ApiProperty({ description: 'Number of rooms', minimum: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  rooms?: number;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;
}
