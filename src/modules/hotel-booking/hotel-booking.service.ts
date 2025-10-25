import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { HotelBookingFilterDto } from './dto/hotel-booking-filter.dto';
import { HotelBooking, Prisma, Status, UserType } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { UserService } from '../user/user.service';

@Injectable()
export class HotelBookingService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  private canUserEditBooking(user: { user_type: UserType }, booking: { status: Status }): boolean {
    // Makers can only edit PENDING bookings
    if (user.user_type === UserType.MAKER) {
      return booking.status === Status.PENDING;
    }
    // CHECKER users can edit any booking
    return true;
  }

  private canUserDeleteBooking(user: { user_type: UserType }, booking: { status: Status }): boolean {
    // Makers can only delete PENDING bookings
    if (user.user_type === UserType.MAKER) {
      return booking.status === Status.PENDING;
    }
    // CHECKER users can delete any booking
    return true;
  }

    async create(createHotelBookingDto: CreateHotelBookingDto, req: Request): Promise<HotelBooking> {
       const currentUser = await this.userService.getAuthenticatedUser(req);
    try {
      // Validate that the hotel exists
      const hotel = await this.prisma.hotel.findFirst({
        where: {
          id: createHotelBookingDto.hotelId,
          status: Status.ACTIVE,
          deleted_at: null,
        },
      });

      if (!hotel) {
        throw new NotFoundException('Hotel not found or inactive');
      }

      // Validate dates
      const checkInDate = new Date(createHotelBookingDto.checkInDate);
      const checkOutDate = new Date(createHotelBookingDto.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new BadRequestException('Check-in date cannot be in the past');
      }

      if (checkOutDate <= checkInDate) {
        throw new BadRequestException('Check-out date must be after check-in date');
      }

       // Check for overlapping bookings (only ACTIVE bookings conflict)
       const overlappingBooking = await this.prisma.hotelBooking.findFirst({
         where: {
           hotel_id: createHotelBookingDto.hotelId,
           status: Status.ACTIVE,
           deleted_at: null,
          OR: [
            {
              AND: [
                { check_in_date: { lte: checkInDate } },
                { check_out_date: { gt: checkInDate } },
              ],
            },
            {
              AND: [
                { check_in_date: { lt: checkOutDate } },
                { check_out_date: { gte: checkOutDate } },
              ],
            },
            {
              AND: [
                { check_in_date: { gte: checkInDate } },
                { check_out_date: { lte: checkOutDate } },
              ],
            },
          ],
        },
        });

        if (overlappingBooking) {
        throw new BadRequestException('Hotel is already booked for the selected dates');
      }

       const hotelBooking = await this.prisma.hotelBooking.create({
         data: {
           customer_name: createHotelBookingDto.customerName,
           customer_email: createHotelBookingDto.customerEmail,
           hotel_id: createHotelBookingDto.hotelId,
           check_in_date: checkInDate,
           check_out_date: checkOutDate,
           guests: createHotelBookingDto.guests || 1,
           rooms: createHotelBookingDto.rooms || 1,
           special_requests: createHotelBookingDto.specialRequests || '',
           user_id: currentUser?.id,
           created_by_id: currentUser?.id,
         },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              location: true,
              city: true,
              country: true,
              price: true,
              currency: true,
              rating: true,
              star_rating: true,
            },
          },
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      });

      return hotelBooking;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Booking already exists');
        }
      }
      throw error;
    }
  }

  async findAll(filters: HotelBookingFilterDto): Promise<PaginatedResponse<HotelBooking>> {
    const {
      customer_name,
      customer_email,
      hotel_id,
      check_in_date_from,
      check_in_date_to,
      check_out_date_from,
      check_out_date_to,
      min_guests,
      max_guests,
      min_rooms,
      max_rooms,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = filters;

     const where: Prisma.HotelBookingWhereInput = {
       status: {
         in: [Status.ACTIVE, Status.PENDING],
       },
       deleted_at: null,
     };

    // Apply filters
    if (customer_name) {
      where.customer_name = {
        contains: customer_name,
        mode: 'insensitive',
      };
    }

    if (customer_email) {
      where.customer_email = {
        contains: customer_email,
        mode: 'insensitive',
      };
    }

    if (hotel_id) {
      where.hotel_id = hotel_id;
    }

    if (check_in_date_from || check_in_date_to) {
      where.check_in_date = {};
      if (check_in_date_from) {
        where.check_in_date.gte = new Date(check_in_date_from);
      }
      if (check_in_date_to) {
        where.check_in_date.lte = new Date(check_in_date_to);
      }
    }

    if (check_out_date_from || check_out_date_to) {
      where.check_out_date = {};
      if (check_out_date_from) {
        where.check_out_date.gte = new Date(check_out_date_from);
      }
      if (check_out_date_to) {
        where.check_out_date.lte = new Date(check_out_date_to);
      }
    }

    if (min_guests || max_guests) {
      where.guests = {};
      if (min_guests) {
        where.guests.gte = min_guests;
      }
      if (max_guests) {
        where.guests.lte = max_guests;
      }
    }

    if (min_rooms || max_rooms) {
      where.rooms = {};
      if (min_rooms) {
        where.rooms.gte = min_rooms;
      }
      if (max_rooms) {
        where.rooms.lte = max_rooms;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.hotelBooking.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              location: true,
              city: true,
              country: true,
              price: true,
              currency: true,
              rating: true,
              star_rating: true,
            },
          },
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sort_by]: sort_order,
        },
        skip,
        take: limit,
      }),
      this.prisma.hotelBooking.count({ where }),
    ]);

     return {
       items: bookings,
       total,
       page,
       limit,
     };
  }

   async findOne(id: string): Promise<HotelBooking> {
     const hotelBooking = await this.prisma.hotelBooking.findFirst({
       where: {
         id,
         status: {
           in: [Status.ACTIVE,Status.PENDING],
         },
         deleted_at: null,
       },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            location: true,
            city: true,
            country: true,
            price: true,
            currency: true,
            rating: true,
            star_rating: true,
          },
        },
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!hotelBooking) {
      throw new NotFoundException('Hotel booking not found');
    }

    return hotelBooking;
  }

   async update(id: string, updateHotelBookingDto: UpdateHotelBookingDto, req: Request): Promise<HotelBooking> {
     const currentUser = await this.userService.getAuthenticatedUser(req);
     const existingBooking = await this.findOne(id);

     // Check if user can edit this booking based on their role and booking status
     if (!this.canUserEditBooking(currentUser, existingBooking)) {
       throw new BadRequestException('You do not have permission to edit this booking. Makers can only edit PENDING bookings.');
     }

     try {
       // If dates are being updated, validate them
       if (updateHotelBookingDto.checkInDate || updateHotelBookingDto.checkOutDate) {
         const checkInDate = updateHotelBookingDto.checkInDate 
           ? new Date(updateHotelBookingDto.checkInDate)
           : existingBooking.check_in_date;
         const checkOutDate = updateHotelBookingDto.checkOutDate
           ? new Date(updateHotelBookingDto.checkOutDate)
           : existingBooking.check_out_date;

        if (checkOutDate <= checkInDate) {
          throw new BadRequestException('Check-out date must be after check-in date');
        }

        // Check for overlapping bookings (excluding current booking)
        const overlappingBooking = await this.prisma.hotelBooking.findFirst({
          where: {
            id: { not: id },
            hotel_id: existingBooking.hotel_id,
            status: Status.ACTIVE,
            deleted_at: null,
            OR: [
              {
                AND: [
                  { check_in_date: { lte: checkInDate } },
                  { check_out_date: { gt: checkInDate } },
                ],
              },
              {
                AND: [
                  { check_in_date: { lt: checkOutDate } },
                  { check_out_date: { gte: checkOutDate } },
                ],
              },
              {
                AND: [
                  { check_in_date: { gte: checkInDate } },
                  { check_out_date: { lte: checkOutDate } },
                ],
              },
            ],
          },
        });

        if (overlappingBooking) {
          throw new BadRequestException('Hotel is already booked for the selected dates');
        }
      }

       const hotelBooking = await this.prisma.hotelBooking.update({
         where: { id },
         data: {
           customer_name: updateHotelBookingDto.customerName,
           customer_email: updateHotelBookingDto.customerEmail,
           check_in_date: updateHotelBookingDto.checkInDate ? new Date(updateHotelBookingDto.checkInDate) : undefined,
           check_out_date: updateHotelBookingDto.checkOutDate ? new Date(updateHotelBookingDto.checkOutDate) : undefined,
           guests: updateHotelBookingDto.guests,
           rooms: updateHotelBookingDto.rooms,
           special_requests: updateHotelBookingDto.specialRequests,
           updated_by_id: currentUser?.id,
         },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              location: true,
              city: true,
              country: true,
              price: true,
              currency: true,
              rating: true,
              star_rating: true,
            },
          },
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      });

      return hotelBooking;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Hotel booking not found');
        }
      }
      throw error;
    }
  }

   async remove(id: string, req: Request): Promise<{ message: string }> {
     const currentUser = await this.userService.getAuthenticatedUser(req);
     const existingBooking = await this.findOne(id);

     // Check if user can delete this booking based on their role and booking status
     if (!this.canUserDeleteBooking(currentUser, existingBooking)) {
       throw new BadRequestException('You do not have permission to delete this booking. Makers can only delete PENDING bookings.');
     }

     await this.prisma.hotelBooking.update({
       where: { id },
       data: {
         status: Status.DELETE,
         deleted_by_id: currentUser.id,
         deleted_at: new Date(),
       },
     });
       return { message: 'Hotel booking deleted successfully' };
   }

  async findByUser(req: Request, filters: HotelBookingFilterDto): Promise<PaginatedResponse<HotelBooking>> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const userFilters = {
      ...filters,
      user_id: currentUser?.id,
    };

    return this.findAll(userFilters);
  }

   async findByHotel(hotelId: string, filters: HotelBookingFilterDto): Promise<PaginatedResponse<HotelBooking>> {
     const hotelFilters = {
       ...filters,
       hotel_id: hotelId,
     };

     return this.findAll(hotelFilters);
   }

   async findPendingBookings(filters: HotelBookingFilterDto): Promise<PaginatedResponse<HotelBooking>> {
     const pendingFilters = {
       ...filters,
       status: Status.PENDING,
     };

     return this.findAll(pendingFilters);
   }

   async approveBooking(id: string, req: Request): Promise<HotelBooking> {
     const currentUser = await this.userService.getAuthenticatedUser(req);
     
     // Check if booking exists and is in PENDING status
     const existingBooking = await this.prisma.hotelBooking.findFirst({
       where: {
         id,
         status: Status.PENDING,
         deleted_at: null,
       },
     });

     if (!existingBooking) {
       throw new NotFoundException('Pending booking not found');
     }

     // Check for overlapping ACTIVE bookings
     const overlappingBooking = await this.prisma.hotelBooking.findFirst({
       where: {
         id: { not: id },
         hotel_id: existingBooking.hotel_id,
         status: Status.ACTIVE,
         deleted_at: null,
         OR: [
           {
             AND: [
               { check_in_date: { lte: existingBooking.check_in_date } },
               { check_out_date: { gt: existingBooking.check_in_date } },
             ],
           },
           {
             AND: [
               { check_in_date: { lt: existingBooking.check_out_date } },
               { check_out_date: { gte: existingBooking.check_out_date } },
             ],
           },
           {
             AND: [
               { check_in_date: { gte: existingBooking.check_in_date } },
               { check_out_date: { lte: existingBooking.check_out_date } },
             ],
           },
         ],
       },
     });

     if (overlappingBooking) {
       throw new BadRequestException('Cannot approve booking: Hotel is already booked for the selected dates');
     }

     // Update booking status to ACTIVE
     const updatedBooking = await this.prisma.hotelBooking.update({
       where: { id },
       data: {
         status: Status.ACTIVE,
         updated_by_id: currentUser?.id,
       },
       include: {
         hotel: {
           select: {
             id: true,
             name: true,
             location: true,
             city: true,
             country: true,
             price: true,
             currency: true,
             rating: true,
             star_rating: true,
           },
         },
         user: {
           select: {
             id: true,
             full_name: true,
             email: true,
           },
         },
       },
     });

     return updatedBooking;
   }

   async rejectBooking(id: string, req: Request): Promise<HotelBooking> {
     const currentUser = await this.userService.getAuthenticatedUser(req);
     
     // Check if booking exists and is in PENDING status
     const existingBooking = await this.prisma.hotelBooking.findFirst({
       where: {
         id,
         status: Status.PENDING,
         deleted_at: null,
       },
     });

     if (!existingBooking) {
       throw new NotFoundException('Pending booking not found');
     }

     // Update booking status to INACTIVE (rejected)
     const updatedBooking = await this.prisma.hotelBooking.update({
       where: { id },
       data: {
         status: Status.INACTIVE,
         updated_by_id: currentUser?.id,
       },
       include: {
         hotel: {
           select: {
             id: true,
             name: true,
             location: true,
             city: true,
             country: true,
             price: true,
             currency: true,
             rating: true,
             star_rating: true,
           },
         },
         user: {
           select: {
             id: true,
             full_name: true,
             email: true,
           },
         },
       },
     });

     return updatedBooking;
   }
}
