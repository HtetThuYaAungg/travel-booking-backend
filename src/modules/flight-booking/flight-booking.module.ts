import { Module } from '@nestjs/common';
import { FlightBookingService } from './flight-booking.service';
import { FlightBookingController } from './flight-booking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, PermissionModule, UserModule],
  controllers: [FlightBookingController],
  providers: [FlightBookingService],
  exports: [FlightBookingService],
})
export class FlightBookingModule {}
