import { PartialType } from '@nestjs/swagger';
import { CreateFlightBookingDto } from './create-flight-booking.dto';

export class UpdateFlightBookingDto extends PartialType(CreateFlightBookingDto) {}
