import { Injectable, NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { UpdateFlightBookingDto } from './dto/update-flight-booking.dto';
import { FlightBookingFilterDto } from './dto/flight-booking-filter.dto';
import { FlightBookingEntity } from './entities/flight-booking.entity';
import { FlightBooking, Prisma, Status } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class FlightBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(createFlightBookingDto: CreateFlightBookingDto, req: Request): Promise<FlightBookingEntity> {

       const currentUser = await this.userService.getAuthenticatedUser(req);
     console.log(currentUser);
      //  if (!currentUser) {
      //   throw new UnauthorizedException('User not found');
      //  }

    // Validate flight exists and has available seats
    const flight = await this.prisma.flight.findFirst({
      where: { 
        id: createFlightBookingDto.flight_id,
        deleted_at: null 
      },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    if (flight.available_seats < createFlightBookingDto.passengers.length) {
      throw new BadRequestException('Not enough available seats');
    }

    // Calculate total price
    const totalPrice = (createFlightBookingDto.base_price + (createFlightBookingDto.taxes_fees || 0) - (createFlightBookingDto.discounts || 0)) * createFlightBookingDto.passengers.length;

    // Generate unique booking reference
    const bookingReference = await this.generateBookingReference();

    // Validate dates
    const departureDate = new Date(createFlightBookingDto.departure_date);
    const returnDate = createFlightBookingDto.return_date ? new Date(createFlightBookingDto.return_date) : null;

    if (returnDate && returnDate <= departureDate) {
      throw new BadRequestException('Return date must be after departure date');
    }

    const booking = await this.prisma.flightBooking.create({
      data: {
        ...createFlightBookingDto,
        booking_reference: bookingReference,
        passengers: createFlightBookingDto.passengers as any,
        departure_date: departureDate,
        return_date: returnDate,
        total_price: totalPrice,
        total_passengers: createFlightBookingDto.passengers.length,
        seat_preferences: createFlightBookingDto.seat_preferences || [],
        meal_preferences: createFlightBookingDto.meal_preferences || [],
        user_id: currentUser.id,
        created_by_id: currentUser.id,
      },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    // Update flight available seats
    await this.prisma.flight.update({
      where: { id: flight.id },
      data: {
        available_seats: flight.available_seats - createFlightBookingDto.passengers.length,
      },
    });

    return new FlightBookingEntity(booking);
  }

  async findAll(filterDto: FlightBookingFilterDto): Promise<{ items: FlightBookingEntity[]; total: number; page: number; limit: number }> {
    const {
      search,
      booking_reference,
      customer_name,
      customer_email,
      flight_id,
      user_id,
      departure_date,
      return_date,
      min_price,
      max_price,
      status,
      payment_status,
      currency,
      is_round_trip,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = filterDto;

    const where: Prisma.FlightBookingWhereInput = {
      deleted_at: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { booking_reference: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Specific filters
    if (booking_reference) {
      where.booking_reference = { contains: booking_reference, mode: 'insensitive' };
    }
    if (customer_name) {
      where.customer_name = { contains: customer_name, mode: 'insensitive' };
    }
    if (customer_email) {
      where.customer_email = { contains: customer_email, mode: 'insensitive' };
    }
    if (flight_id) {
      where.flight_id = flight_id;
    }
    if (user_id) {
      where.user_id = user_id;
    }

    // Date filters
    if (departure_date) {
      const startDate = new Date(departure_date);
      const endDate = new Date(departure_date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.departure_date = {
        gte: startDate,
        lt: endDate,
      };
    }
    if (return_date) {
      const startDate = new Date(return_date);
      const endDate = new Date(return_date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.return_date = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Price filters
    if (min_price !== undefined && max_price !== undefined) {
      where.total_price = { gte: min_price, lte: max_price };
    } else if (min_price !== undefined) {
      where.total_price = { gte: min_price };
    } else if (max_price !== undefined) {
      where.total_price = { lte: max_price };
    }

    // Status filters
    if (status) {
      where.status = status as any;
    }
    if (payment_status) {
      where.payment_status = payment_status;
    }
    if (currency) {
      where.currency = currency;
    }

    // Round trip filter
    if (is_round_trip !== undefined) {
      if (is_round_trip) {
        where.return_date = { not: null };
      } else {
        where.return_date = null;
      }
    }

    // Sorting
    const orderBy: Prisma.FlightBookingOrderByWithRelationInput = {};
    if (sort_by === 'price') {
      orderBy.total_price = sort_order;
    } else if (sort_by === 'departure_date') {
      orderBy.departure_date = sort_order;
    } else if (sort_by === 'customer_name') {
      orderBy.customer_name = sort_order;
    } else {
      orderBy.created_at = sort_order;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.flightBooking.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          flight: true,
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.flightBooking.count({ where }),
    ]);

    return {
      items: bookings.map(booking => new FlightBookingEntity(booking)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FlightBookingEntity> {
    const booking = await this.prisma.flightBooking.findFirst({
      where: { id, deleted_at: null },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Flight booking with ID ${id} not found`);
    }

    return new FlightBookingEntity(booking);
  }

  async findByReference(bookingReference: string): Promise<FlightBookingEntity> {
    const booking = await this.prisma.flightBooking.findFirst({
      where: { booking_reference: bookingReference, deleted_at: null },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Flight booking with reference ${bookingReference} not found`);
    }

    return new FlightBookingEntity(booking);
  }

  async update(id: string, updateFlightBookingDto: UpdateFlightBookingDto, req: Request): Promise<FlightBookingEntity> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const existingBooking = await this.prisma.flightBooking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Flight booking with ID ${id} not found`);
    }

    // Prevent updates to confirmed bookings
    const updateStatus = (updateFlightBookingDto as any).status;
    if (String(existingBooking.status) === 'CONFIRMED' && updateStatus && String(updateStatus) !== 'CONFIRMED') {
      throw new BadRequestException('Cannot modify confirmed bookings');
    }

    // If changing passengers, validate seat availability
    if (updateFlightBookingDto.passengers) {
      const flight = await this.prisma.flight.findFirst({
        where: { id: existingBooking.flight_id, deleted_at: null },
      });

      if (!flight) {
        throw new NotFoundException('Flight not found');
      }

      const currentPassengers = existingBooking.total_passengers;
      const newPassengers = updateFlightBookingDto.passengers.length;
      const seatDifference = newPassengers - currentPassengers;

      if (seatDifference > 0 && flight.available_seats < seatDifference) {
        throw new BadRequestException('Not enough available seats for the additional passengers');
      }

      // Update flight available seats
      await this.prisma.flight.update({
        where: { id: flight.id },
        data: {
          available_seats: flight.available_seats - seatDifference,
        },
      });

      (updateFlightBookingDto as any).total_passengers = newPassengers;
    }

    // Recalculate total price if pricing fields changed
    if (updateFlightBookingDto.base_price || updateFlightBookingDto.taxes_fees || updateFlightBookingDto.discounts) {
      const basePrice = updateFlightBookingDto.base_price ?? existingBooking.base_price;
      const taxesFees = updateFlightBookingDto.taxes_fees ?? existingBooking.taxes_fees;
      const discounts = updateFlightBookingDto.discounts ?? existingBooking.discounts;
      const passengers = (updateFlightBookingDto as any).total_passengers ?? existingBooking.total_passengers;
      
      (updateFlightBookingDto as any).total_price = (basePrice + taxesFees - discounts) * passengers;
    }

    const booking = await this.prisma.flightBooking.update({
      where: { id },
      data: {
        ...updateFlightBookingDto,
        passengers: updateFlightBookingDto.passengers as any,
        updated_by_id: currentUser.id,
      },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return new FlightBookingEntity(booking);
  }

  async remove(id: string, req: Request):Promise<{ message: string }> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const existingBooking = await this.prisma.flightBooking.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Flight booking with ID ${id} not found`);
    }

    // Restore seats to flight
    const flight = await this.prisma.flight.findFirst({
      where: { id: existingBooking.flight_id, deleted_at: null },
    });

    if (flight) {
      await this.prisma.flight.update({
        where: { id: flight.id },
        data: {
          available_seats: flight.available_seats + existingBooking.total_passengers,
        },
      });
    }

    await this.prisma.flightBooking.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: currentUser.id,
      },
    });
    return { message: 'Flight booking deleted successfully' };
  }

  async getUserBookings(req: Request, filterDto: FlightBookingFilterDto): Promise<{ items: FlightBookingEntity[]; total: number; page: number; limit: number }> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    return this.findAll({ ...filterDto, user_id: currentUser.id });
  }

  async updateBookingStatus(id: string, status: string, req: Request): Promise<FlightBookingEntity> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.update(id, { status } as any, req);
  }

  async updatePaymentStatus(id: string, paymentStatus: string, req: Request): Promise<FlightBookingEntity> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const validPaymentStatuses = ['PENDING', 'PAID', 'REFUNDED', 'FAILED'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new BadRequestException(`Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`);
    }

    return this.update(id, { payment_status: paymentStatus }, req);
  }

  private async generateBookingReference(): Promise<string> {
    let bookingReference: string = '';
    let isUnique = false;

    while (!isUnique) {
      const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      bookingReference = `FB${randomNumber}`;

      const existing = await this.prisma.flightBooking.findFirst({
        where: { booking_reference: bookingReference },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return bookingReference;
  }

  async getBookingStatistics(): Promise<{
    total_bookings: number;
    total_revenue: number;
    pending_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    average_booking_value: number;
  }> {
    const [
      totalBookings,
      revenueData,
      statusCounts,
    ] = await Promise.all([
      this.prisma.flightBooking.count({
        where: { deleted_at: null },
      }),
      this.prisma.flightBooking.aggregate({
        where: { deleted_at: null },
        _sum: { total_price: true },
      }),
      this.prisma.flightBooking.groupBy({
        by: ['status'],
        where: { deleted_at: null },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = revenueData._sum.total_price || 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const statusStats = statusCounts.reduce((acc, item) => {
      acc[`${item.status.toLowerCase()}_bookings`] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_bookings: totalBookings,
      total_revenue: totalRevenue,
      average_booking_value: averageBookingValue,
      pending_bookings: statusStats.pending_bookings || 0,
      confirmed_bookings: statusStats.confirmed_bookings || 0,
      cancelled_bookings: statusStats.cancelled_bookings || 0,
    };
  }

  async approveBooking(id: string, req: Request): Promise<FlightBookingEntity> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if booking exists and is in PENDING status
    const existingBooking = await this.prisma.flightBooking.findFirst({
      where: {
        id,
        status: Status.PENDING,
        deleted_at: null,
      },
      include: {
        flight: true,
      },
    });

    if (!existingBooking) {
      throw new NotFoundException('Pending flight booking not found');
    }

    // Verify that the flight still exists and is valid
    const flight = await this.prisma.flight.findFirst({
      where: {
        id: existingBooking.flight_id,
        deleted_at: null,
      },
    });

    if (!flight) {
      throw new NotFoundException('Flight associated with this booking no longer exists');
    }

    // Check if flight still has enough available seats
    // Note: Since seats were already reserved when booking was created, we just verify the flight is still active
    if (flight.available_seats < 0) {
      throw new BadRequestException('Flight no longer has available seats');
    }

    // Update booking status to CONFIRMED
    const updatedBooking = await this.prisma.flightBooking.update({
      where: { id },
      data: {
        status: Status.ACTIVE,
        updated_by_id: currentUser.id,
      },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return new FlightBookingEntity(updatedBooking);
  }

  async rejectBooking(id: string, req: Request): Promise<FlightBookingEntity> {
    const currentUser = await this.userService.getAuthenticatedUser(req);

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if booking exists and is in PENDING status
    const existingBooking = await this.prisma.flightBooking.findFirst({
      where: {
        id,
        status: Status.PENDING,
        deleted_at: null,
      },
      include: {
        flight: true,
      },
    });

    if (!existingBooking) {
      throw new NotFoundException('Pending flight booking not found');
    }

    // Restore seats to the flight since booking is being rejected
    const flight = await this.prisma.flight.findFirst({
      where: {
        id: existingBooking.flight_id,
        deleted_at: null,
      },
    });

    if (flight) {
      await this.prisma.flight.update({
        where: { id: flight.id },
        data: {
          available_seats: flight.available_seats + existingBooking.total_passengers,
        },
      });
    }

    // Update booking status to CANCELLED (rejected)
    const updatedBooking = await this.prisma.flightBooking.update({
      where: { id },
      data: {
        status: Status.REJECTED,
        updated_by_id: currentUser.id,
      },
      include: {
        flight: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return new FlightBookingEntity(updatedBooking);
  }
}
