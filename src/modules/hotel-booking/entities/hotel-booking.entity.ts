import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class HotelBookingEntity {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  customer_name: string;

  @ApiProperty()
  @Expose()
  customer_email: string;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  check_in_date: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  check_out_date: Date;

  @ApiProperty()
  @Expose()
  guests: number;

  @ApiProperty()
  @Expose()
  rooms: number;

  @ApiProperty({ required: false })
  @Expose()
  special_requests?: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  hotel_id: string;

  @ApiProperty({ required: false })
  @Expose()
  user_id?: string;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  updated_at: Date;

  // Hotel relation
  @ApiProperty({ required: false })
  @Expose()
  hotel?: {
    id: string;
    name: string;
    location: string;
    city: string;
    country: string;
    price: number;
    currency: string;
    rating: number;
    star_rating: number;
  };

  // User relation
  @ApiProperty({ required: false })
  @Expose()
  user?: {
    id: string;
    full_name: string;
    email: string;
  };

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
    
    // Handle date transformations
    if (partial.check_in_date) {
      this.check_in_date = new Date(partial.check_in_date);
    }
    
    if (partial.check_out_date) {
      this.check_out_date = new Date(partial.check_out_date);
    }
    
    if (partial.created_at) {
      this.created_at = new Date(partial.created_at);
    }
    
    if (partial.updated_at) {
      this.updated_at = new Date(partial.updated_at);
    }
  }
}
