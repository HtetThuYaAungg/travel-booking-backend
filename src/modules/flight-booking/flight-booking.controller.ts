import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FlightBookingService } from './flight-booking.service';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { UpdateFlightBookingDto } from './dto/update-flight-booking.dto';
import { FlightBookingFilterDto } from './dto/flight-booking-filter.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { FlightBooking } from '@prisma/client';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public';

@ApiTags('Flight Bookings')
@Controller('flight-bookings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FlightBookingController {
  constructor(private readonly flightBookingService: FlightBookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flight booking' })
  @ApiResponse({ status: 201, description: 'Flight booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Permission('flight-bookings:create')
  async create(@Body() createFlightBookingDto: CreateFlightBookingDto, @Request() req) {
    console.log(req);
    return this.flightBookingService.create(createFlightBookingDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flight bookings with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Flight bookings retrieved successfully' })
  @Permission('flight-bookings:read')
  async findAll(@Query() filterDto: FlightBookingFilterDto) {
    return this.flightBookingService.findAll(filterDto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user flight bookings' })
  @ApiResponse({ status: 200, description: 'User flight bookings retrieved successfully' })
  async getMyBookings(@Query() filterDto: FlightBookingFilterDto, @Request() req) {
    return this.flightBookingService.getUserBookings(req, filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get flight booking statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Permission('flight-bookings:read')
  async getStatistics() {
    return this.flightBookingService.getBookingStatistics();
  }

  @Get('reference/:reference')
  @ApiOperation({ summary: 'Get flight booking by reference number' })
  @ApiResponse({ status: 200, description: 'Flight booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Flight booking not found' })
  @Permission('flight-bookings:read')
  async findByReference(@Param('reference') reference: string) {
    return this.flightBookingService.findByReference(reference);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight booking by ID' })
  @ApiResponse({ status: 200, description: 'Flight booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Flight booking not found' })
  @Permission('flight-bookings:read')
  async findOne(@Param('id') id: string) {
    return this.flightBookingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight booking' })
  @ApiResponse({ status: 200, description: 'Flight booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Flight booking not found' })
  @Permission('flight-bookings:update')
  async update(@Param('id') id: string, @Body() updateFlightBookingDto: UpdateFlightBookingDto, @Request() req) {
    return this.flightBookingService.update(id, updateFlightBookingDto, req);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update flight booking status' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @Permission('flight-bookings:edit')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req
  ) {
    return this.flightBookingService.updateBookingStatus(id, status, req);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update flight booking payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment status' })
  @Permission('flight-bookings:edit')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('payment_status') paymentStatus: string,
    @Request() req
  ) {
    return this.flightBookingService.updatePaymentStatus(id, paymentStatus, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flight booking' })
  @ApiResponse({ status: 204, description: 'Flight booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flight booking not found' })
  @Permission('flight-bookings:delete')
  async remove(@Param('id') id: string, @Request() req) {
    return this.flightBookingService.remove(id, req);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a pending flight booking' })
  @ApiResponse({ status: 200, description: 'Flight booking approved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - booking cannot be approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pending booking not found' })
  @Permission('flight-bookings:approve')
  async approveBooking(@Param('id') id: string, @Request() req) {
    return this.flightBookingService.approveBooking(id, req);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending flight booking' })
  @ApiResponse({ status: 200, description: 'Flight booking rejected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pending booking not found' })
  @Permission('flight-bookings:reject')
  async rejectBooking(@Param('id') id: string, @Request() req) {
    return this.flightBookingService.rejectBooking(id, req);
  }
}
