import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class FlightBookingEntity {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  booking_reference: string;

  @ApiProperty()
  @Expose()
  customer_name: string;

  @ApiProperty()
  @Expose()
  customer_email: string;

  @ApiProperty({ required: false })
  @Expose()
  customer_phone?: string;

  @ApiProperty()
  @Expose()
  passengers: any[];

  @ApiProperty()
  @Expose()
  total_passengers: number;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  departure_date: Date;

  @ApiProperty({ required: false })
  @Expose()
  @Type(() => Date)
  return_date?: Date;

  @ApiProperty()
  @Expose()
  total_price: number;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty()
  @Expose()
  base_price: number;

  @ApiProperty()
  @Expose()
  taxes_fees: number;

  @ApiProperty()
  @Expose()
  discounts: number;

  @ApiProperty({ required: false })
  @Expose()
  seat_preferences?: any[];

  @ApiProperty({ required: false })
  @Expose()
  meal_preferences?: any[];

  @ApiProperty({ required: false })
  @Expose()
  special_requests?: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  payment_status: string;

  @ApiProperty()
  @Expose()
  flight_id: string;

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

  // Flight relation
  @ApiProperty({ required: false })
  @Expose()
  flight?: {
    id: string;
    flight_number: string;
    airline_name: string;
    airline_code: string;
    aircraft_type: string;
    departure_airport_code: string;
    departure_airport_name: string;
    departure_city: string;
    departure_country: string;
    arrival_airport_code: string;
    arrival_airport_name: string;
    arrival_city: string;
    arrival_country: string;
    departure_time: Date;
    arrival_time: Date;
    duration_minutes: number;
    base_price: number;
    currency: string;
    class_type: string;
  };

  // User relation
  @ApiProperty({ required: false })
  @Expose()
  user?: {
    id: string;
    full_name: string;
    email: string;
  };

  // Computed properties
  @ApiProperty()
  @Expose()
  get is_round_trip(): boolean {
    return !!this.return_date;
  }

  @ApiProperty()
  @Expose()
  get total_passengers_formatted(): string {
    return `${this.total_passengers} passenger${this.total_passengers > 1 ? 's' : ''}`;
  }

  @ApiProperty()
  @Expose()
  get price_formatted(): string {
    return `${this.currency} ${this.total_price.toFixed(2)}`;
  }

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
  }
}
