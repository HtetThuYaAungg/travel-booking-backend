import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class FlightEntity {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  flight_number: string;

  @ApiProperty()
  @Expose()
  airline_name: string;

  @ApiProperty()
  @Expose()
  airline_code: string;

  @ApiProperty()
  @Expose()
  aircraft_type: string;

  @ApiProperty()
  @Expose()
  departure_airport_code: string;

  @ApiProperty()
  @Expose()
  departure_airport_name: string;

  @ApiProperty()
  @Expose()
  departure_city: string;

  @ApiProperty()
  @Expose()
  departure_country: string;

  @ApiProperty()
  @Expose()
  arrival_airport_code: string;

  @ApiProperty()
  @Expose()
  arrival_airport_name: string;

  @ApiProperty()
  @Expose()
  arrival_city: string;

  @ApiProperty()
  @Expose()
  arrival_country: string;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  departure_time: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  arrival_time: Date;

  @ApiProperty()
  @Expose()
  duration_minutes: number;

  @ApiProperty()
  @Expose()
  base_price: number;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty()
  @Expose()
  available_seats: number;

  @ApiProperty()
  @Expose()
  total_seats: number;

  @ApiProperty()
  @Expose()
  class_type: string;

  @ApiProperty()
  @Expose()
  has_wifi: boolean;

  @ApiProperty()
  @Expose()
  has_meal: boolean;

  @ApiProperty()
  @Expose()
  has_entertainment: boolean;

  @ApiProperty()
  @Expose()
  has_luggage: boolean;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  is_domestic: boolean;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  updated_at: Date;

  // Computed properties
  @ApiProperty()
  @Expose()
  get duration_formatted(): string {
    const hours = Math.floor(this.duration_minutes / 60);
    const minutes = this.duration_minutes % 60;
    return `${hours}h ${minutes}m`;
  }

  @ApiProperty()
  @Expose()
  get route(): string {
    return `${this.departure_airport_code} → ${this.arrival_airport_code}`;
  }

  @ApiProperty()
  @Expose()
  get departure_time_formatted(): string {
    return this.departure_time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  @ApiProperty()
  @Expose()
  get arrival_time_formatted(): string {
    return this.arrival_time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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
