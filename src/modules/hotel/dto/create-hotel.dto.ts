import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEmail, IsUrl, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ description: 'Hotel name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Hotel description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Hotel location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Price per night' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Hotel rating (0-5)', minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number = 0;

  @ApiProperty({ description: 'Star rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  star_rating?: number = 1;

  @ApiProperty({ description: 'Hotel amenities', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ description: 'Hotel images URLs', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'Has WiFi', required: false })
  @IsBoolean()
  @IsOptional()
  has_wifi?: boolean = false;

  @ApiProperty({ description: 'Has Pool', required: false })
  @IsBoolean()
  @IsOptional()
  has_pool?: boolean = false;

  @ApiProperty({ description: 'Has Spa', required: false })
  @IsBoolean()
  @IsOptional()
  has_spa?: boolean = false;

  @ApiProperty({ description: 'Has Gym', required: false })
  @IsBoolean()
  @IsOptional()
  has_gym?: boolean = false;

  @ApiProperty({ description: 'Has Restaurant', required: false })
  @IsBoolean()
  @IsOptional()
  has_restaurant?: boolean = false;

  @ApiProperty({ description: 'Has Parking', required: false })
  @IsBoolean()
  @IsOptional()
  has_parking?: boolean = false;

  @ApiProperty({ description: 'Pet Friendly', required: false })
  @IsBoolean()
  @IsOptional()
  has_pet_friendly?: boolean = false;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
