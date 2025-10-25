import { Module } from '@nestjs/common';
import { HotelBookingService } from './hotel-booking.service';
import { HotelBookingController } from './hotel-booking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [PrismaModule, UserModule, PermissionModule],
  controllers: [HotelBookingController],
  providers: [HotelBookingService],
  exports: [HotelBookingService],
})
export class HotelBookingModule {}
