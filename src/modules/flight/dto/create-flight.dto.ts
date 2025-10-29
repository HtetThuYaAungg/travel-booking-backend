import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateFlightDto {
  @ApiProperty({ description: 'Flight number (e.g., 8M335, K7242)' })
  @IsString()
  @IsNotEmpty()
  flight_number: string;

  @ApiProperty({ description: 'Airline name (e.g., Myanmar Airways International)' })
  @IsString()
  @IsNotEmpty()
  airline_name: string;

  @ApiProperty({ description: 'Airline code (e.g., 8M, K7)' })
  @IsString()
  @IsNotEmpty()
  airline_code: string;

  @ApiProperty({ description: 'Aircraft type (e.g., ATR 72, Embraer E190)' })
  @IsString()
  @IsNotEmpty()
  aircraft_type: string;

  @ApiProperty({ description: 'Departure airport code (e.g., RGN)' })
  @IsString()
  @IsNotEmpty()
  departure_airport_code: string;

  @ApiProperty({ description: 'Departure airport name (e.g., Yangon)' })
  @IsString()
  @IsNotEmpty()
  departure_airport_name: string;

  @ApiProperty({ description: 'Departure city' })
  @IsString()
  @IsNotEmpty()
  departure_city: string;

  @ApiProperty({ description: 'Departure country' })
  @IsString()
  @IsNotEmpty()
  departure_country: string;

  @ApiProperty({ description: 'Arrival airport code (e.g., MDL)' })
  @IsString()
  @IsNotEmpty()
  arrival_airport_code: string;

  @ApiProperty({ description: 'Arrival airport name (e.g., Mandalay)' })
  @IsString()
  @IsNotEmpty()
  arrival_airport_name: string;

  @ApiProperty({ description: 'Arrival city' })
  @IsString()
  @IsNotEmpty()
  arrival_city: string;

  @ApiProperty({ description: 'Arrival country' })
  @IsString()
  @IsNotEmpty()
  arrival_country: string;

  @ApiProperty({ description: 'Departure time (ISO 8601 format)' })
  @IsDateString()
  @IsNotEmpty()
  departure_time: string;

  @ApiProperty({ description: 'Arrival time (ISO 8601 format)' })
  @IsDateString()
  @IsNotEmpty()
  arrival_time: string;

  @ApiProperty({ description: 'Flight duration in minutes' })
  @IsNumber()
  @Min(1)
  @Max(1440) // Max 24 hours
  duration_minutes: number;

  @ApiProperty({ description: 'Base price of the flight' })
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Number of available seats' })
  @IsNumber()
  @Min(0)
  available_seats: number;

  @ApiProperty({ description: 'Total number of seats', default: 100 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  total_seats?: number = 100;

  @ApiProperty({ description: 'Flight class type', default: 'Economy' })
  @IsString()
  @IsOptional()
  class_type?: string = 'Economy';

  @ApiProperty({ description: 'Has WiFi', default: false })
  @IsBoolean()
  @IsOptional()
  has_wifi?: boolean = false;

  @ApiProperty({ description: 'Has meal service', default: false })
  @IsBoolean()
  @IsOptional()
  has_meal?: boolean = false;

  @ApiProperty({ description: 'Has entertainment', default: false })
  @IsBoolean()
  @IsOptional()
  has_entertainment?: boolean = false;

  @ApiProperty({ description: 'Has luggage allowance', default: true })
  @IsBoolean()
  @IsOptional()
  has_luggage?: boolean = true;

  @ApiProperty({ description: 'Is domestic flight', default: true })
  @IsBoolean()
  @IsOptional()
  is_domestic?: boolean = true;
}
