import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class HotelEntity {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  location: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  price: number;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty()
  @Expose()
  rating: number;

  @ApiProperty()
  @Expose()
  star_rating: number;

  @ApiProperty({ type: [String] })
  @Expose()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return [];
  })
  amenities: string[];

  @ApiProperty({ type: [String] })
  @Expose()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return [];
  })
  images: string[];

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  has_wifi: boolean;

  @ApiProperty()
  @Expose()
  has_pool: boolean;

  @ApiProperty()
  @Expose()
  has_spa: boolean;

  @ApiProperty()
  @Expose()
  has_gym: boolean;

  @ApiProperty()
  @Expose()
  has_restaurant: boolean;

  @ApiProperty()
  @Expose()
  has_parking: boolean;

  @ApiProperty()
  @Expose()
  has_pet_friendly: boolean;

  @ApiProperty({ required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ required: false })
  @Expose()
  email?: string;

  @ApiProperty({ required: false })
  @Expose()
  website?: string;

  @ApiProperty({ required: false })
  @Expose()
  address?: string;

  @ApiProperty({ required: false })
  @Expose()
  latitude?: number;

  @ApiProperty({ required: false })
  @Expose()
  longitude?: number;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  updated_at: Date;

  @Exclude()
  created_by_id?: string;

  @Exclude()
  updated_by_id?: string;

  @Exclude()
  deleted_by_id?: string;

  @Exclude()
  deleted_at?: Date;

  constructor(partial: any) {
    Object.assign(this, partial);
    
    // Handle Prisma Decimal type for price
    if (partial.price && typeof partial.price === 'object' && partial.price.toNumber) {
      this.price = partial.price.toNumber();
    }
    
    // Handle JSON fields
    if (partial.amenities && typeof partial.amenities === 'string') {
      try {
        this.amenities = JSON.parse(partial.amenities);
      } catch {
        this.amenities = [];
      }
    }
    
    if (partial.images && typeof partial.images === 'string') {
      try {
        this.images = JSON.parse(partial.images);
      } catch {
        this.images = [];
      }
    }
  }
}
