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
import { HotelBookingService } from './hotel-booking.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { HotelBookingFilterDto } from './dto/hotel-booking-filter.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { HotelBooking } from '@prisma/client';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public';

@ApiTags('Hotel Bookings')
@Controller('hotel-bookings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class HotelBookingController {
  constructor(private readonly hotelBookingService: HotelBookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hotel booking' })
  @ApiResponse({ status: 201, description: 'Hotel booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Permission('hotel-bookings:create')
  async create(
    @Body() createHotelBookingDto: CreateHotelBookingDto,
    @Request() req,
  ): Promise<HotelBooking> {
    return this.hotelBookingService.create(createHotelBookingDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotel bookings with filters' })
  @ApiResponse({ status: 200, description: 'Hotel bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'customer_name', required: false, description: 'Filter by customer name' })
  @ApiQuery({ name: 'customer_email', required: false, description: 'Filter by customer email' })
  @ApiQuery({ name: 'hotel_id', required: false, description: 'Filter by hotel ID' })
  @ApiQuery({ name: 'check_in_date_from', required: false, description: 'Filter by check-in date from' })
  @ApiQuery({ name: 'check_in_date_to', required: false, description: 'Filter by check-in date to' })
  @ApiQuery({ name: 'check_out_date_from', required: false, description: 'Filter by check-out date from' })
  @ApiQuery({ name: 'check_out_date_to', required: false, description: 'Filter by check-out date to' })
  @ApiQuery({ name: 'min_guests', required: false, description: 'Filter by minimum guests' })
  @ApiQuery({ name: 'max_guests', required: false, description: 'Filter by maximum guests' })
  @ApiQuery({ name: 'min_rooms', required: false, description: 'Filter by minimum rooms' })
  @ApiQuery({ name: 'max_rooms', required: false, description: 'Filter by maximum rooms' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order (asc/desc)' })
  @Permission('hotel-bookings:list')
  async findAll(@Query() filters: HotelBookingFilterDto): Promise<PaginatedResponse<HotelBooking>> {
    return this.hotelBookingService.findAll(filters);
  }

   @Get('my-bookings')
   @ApiOperation({ summary: 'Get current user hotel bookings' })
   @ApiResponse({ status: 200, description: 'User hotel bookings retrieved successfully' })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   @ApiQuery({ name: 'customer_name', required: false, description: 'Filter by customer name' })
   @ApiQuery({ name: 'customer_email', required: false, description: 'Filter by customer email' })
   @ApiQuery({ name: 'hotel_id', required: false, description: 'Filter by hotel ID' })
   @ApiQuery({ name: 'check_in_date_from', required: false, description: 'Filter by check-in date from' })
   @ApiQuery({ name: 'check_in_date_to', required: false, description: 'Filter by check-in date to' })
   @ApiQuery({ name: 'check_out_date_from', required: false, description: 'Filter by check-out date from' })
   @ApiQuery({ name: 'check_out_date_to', required: false, description: 'Filter by check-out date to' })
   @ApiQuery({ name: 'min_guests', required: false, description: 'Filter by minimum guests' })
   @ApiQuery({ name: 'max_guests', required: false, description: 'Filter by maximum guests' })
   @ApiQuery({ name: 'min_rooms', required: false, description: 'Filter by minimum rooms' })
   @ApiQuery({ name: 'max_rooms', required: false, description: 'Filter by maximum rooms' })
   @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
   @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
   @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field' })
   @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order (asc/desc)' })
   @Permission('hotel-bookings:read')
   async findMyBookings(
     @Query() filters: HotelBookingFilterDto,
     @Request() req,
   ): Promise<PaginatedResponse<HotelBooking>> {
     return this.hotelBookingService.findByUser(req, filters);
   }

   @Get('pending')
   @ApiOperation({ summary: 'Get all pending hotel bookings' })
   @ApiResponse({ status: 200, description: 'Pending hotel bookings retrieved successfully' })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   @ApiQuery({ name: 'customer_name', required: false, description: 'Filter by customer name' })
   @ApiQuery({ name: 'customer_email', required: false, description: 'Filter by customer email' })
   @ApiQuery({ name: 'hotel_id', required: false, description: 'Filter by hotel ID' })
   @ApiQuery({ name: 'check_in_date_from', required: false, description: 'Filter by check-in date from' })
   @ApiQuery({ name: 'check_in_date_to', required: false, description: 'Filter by check-in date to' })
   @ApiQuery({ name: 'check_out_date_from', required: false, description: 'Filter by check-out date from' })
   @ApiQuery({ name: 'check_out_date_to', required: false, description: 'Filter by check-out date to' })
   @ApiQuery({ name: 'min_guests', required: false, description: 'Filter by minimum guests' })
   @ApiQuery({ name: 'max_guests', required: false, description: 'Filter by maximum guests' })
   @ApiQuery({ name: 'min_rooms', required: false, description: 'Filter by minimum rooms' })
   @ApiQuery({ name: 'max_rooms', required: false, description: 'Filter by maximum rooms' })
   @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
   @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
   @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field' })
   @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order (asc/desc)' })
   @Permission('hotel-bookings:read')
   async findPendingBookings(
     @Query() filters: HotelBookingFilterDto,
   ): Promise<PaginatedResponse<HotelBooking>> {
     return this.hotelBookingService.findPendingBookings(filters);
   }

  @Get('hotel/:hotelId')
  @ApiOperation({ summary: 'Get hotel bookings for a specific hotel' })
  @ApiResponse({ status: 200, description: 'Hotel bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'customer_name', required: false, description: 'Filter by customer name' })
  @ApiQuery({ name: 'customer_email', required: false, description: 'Filter by customer email' })
  @ApiQuery({ name: 'check_in_date_from', required: false, description: 'Filter by check-in date from' })
  @ApiQuery({ name: 'check_in_date_to', required: false, description: 'Filter by check-in date to' })
  @ApiQuery({ name: 'check_out_date_from', required: false, description: 'Filter by check-out date from' })
  @ApiQuery({ name: 'check_out_date_to', required: false, description: 'Filter by check-out date to' })
  @ApiQuery({ name: 'min_guests', required: false, description: 'Filter by minimum guests' })
  @ApiQuery({ name: 'max_guests', required: false, description: 'Filter by maximum guests' })
  @ApiQuery({ name: 'min_rooms', required: false, description: 'Filter by minimum rooms' })
  @ApiQuery({ name: 'max_rooms', required: false, description: 'Filter by maximum rooms' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order (asc/desc)' })
  @Permission('hotel-bookings:read')
  async findByHotel(
    @Param('hotelId') hotelId: string,
    @Query() filters: HotelBookingFilterDto,
  ): Promise<PaginatedResponse<HotelBooking>> {
    return this.hotelBookingService.findByHotel(hotelId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotel booking by ID' })
  @ApiResponse({ status: 200, description: 'Hotel booking retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hotel booking not found' })
  @Permission('hotel-bookings:read')
  async findOne(@Param('id') id: string): Promise<HotelBooking> {
    return this.hotelBookingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hotel booking' })
  @ApiResponse({ status: 200, description: 'Hotel booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hotel booking not found' })
  @Permission('hotel-bookings:edit')
  async update(
    @Param('id') id: string,
    @Body() updateHotelBookingDto: UpdateHotelBookingDto,
    @Request() req,
  ): Promise<HotelBooking> {
    return this.hotelBookingService.update(id, updateHotelBookingDto, req);
  }

   @Delete(':id')
   @HttpCode(HttpStatus.NO_CONTENT)
   @ApiOperation({ summary: 'Delete a hotel booking' })
   @ApiResponse({ status: 204, description: 'Hotel booking deleted successfully' })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   @ApiResponse({ status: 404, description: 'Hotel booking not found' })
   @Permission('hotel-bookings:delete')
   async remove(@Param('id') id: string, @Request() req): Promise<{message: string}> {
     return this.hotelBookingService.remove(id, req);
   }

   @Patch(':id/approve')
   @ApiOperation({ summary: 'Approve a pending hotel booking' })
   @ApiResponse({ status: 200, description: 'Hotel booking approved successfully' })
   @ApiResponse({ status: 400, description: 'Bad request - booking cannot be approved' })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   @ApiResponse({ status: 404, description: 'Pending booking not found' })
   @Permission('hotel-bookings:approve')
   async approveBooking(
     @Param('id') id: string,
     @Request() req,
   ): Promise<HotelBooking> {
     return this.hotelBookingService.approveBooking(id, req);
   }

   @Patch(':id/reject')
   @ApiOperation({ summary: 'Reject a pending hotel booking' })
   @ApiResponse({ status: 200, description: 'Hotel booking rejected successfully' })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
   @ApiResponse({ status: 404, description: 'Pending booking not found' })
   @Permission('hotel-bookings:reject')
   async rejectBooking(
     @Param('id') id: string,
     @Request() req,
   ): Promise<HotelBooking> {
     return this.hotelBookingService.rejectBooking(id, req);
   }
}
