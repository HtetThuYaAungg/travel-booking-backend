import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDateString, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CreateHotelBookingDto {
  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({ description: 'Check-in date' })
  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @ApiProperty({ description: 'Check-out date' })
  @IsDateString()
  @IsNotEmpty()
  checkOutDate: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  guests?: number = 1;

  @ApiProperty({ description: 'Number of rooms', minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  rooms?: number = 1;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string = '';

  @ApiProperty({ description: 'Hotel ID' })
  @IsString()
  @IsNotEmpty()
  hotelId: string;
}
