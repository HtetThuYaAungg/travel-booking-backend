import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelFilterDto } from './dto/hotel-filter.dto';
import { Hotel, Prisma, Status } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { UserService } from '../user/user.service';

@Injectable()
export class HotelService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(createHotelDto: CreateHotelDto, userId: string): Promise<Hotel> {
    try {
      const hotel = await this.prisma.hotel.create({
        data: {
          ...createHotelDto,
          created_by_id: userId,
        },
      });

      return hotel;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Hotel with this name and location already exists',
          );
        }
      }
      throw error;
    }
  }

  async findAll(filters: HotelFilterDto): Promise<PaginatedResponse<Hotel>> {
    const {
      search,
      city,
      country,
      min_price,
      max_price,
      min_star_rating,
      min_rating,
      has_wifi,
      has_pool,
      has_spa,
      has_gym,
      has_restaurant,
      has_parking,
      has_pet_friendly,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = filters;

    const where: Prisma.HotelWhereInput = {
      deleted_at: null,
      status: 'ACTIVE',
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Location filters
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    // Price filters
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) {
        where.price.gte = min_price;
      }
      if (max_price !== undefined) {
        where.price.lte = max_price;
      }
    }

    // Rating filters
    if (min_star_rating !== undefined) {
      where.star_rating = { gte: min_star_rating };
    }

    if (min_rating !== undefined) {
      where.rating = { gte: min_rating };
    }

    // Amenity filters
    if (has_wifi !== undefined) {
      where.has_wifi = has_wifi;
    }

    if (has_pool !== undefined) {
      where.has_pool = has_pool;
    }

    if (has_spa !== undefined) {
      where.has_spa = has_spa;
    }

    if (has_gym !== undefined) {
      where.has_gym = has_gym;
    }

    if (has_restaurant !== undefined) {
      where.has_restaurant = has_restaurant;
    }

    if (has_parking !== undefined) {
      where.has_parking = has_parking;
    }

    if (has_pet_friendly !== undefined) {
      where.has_pet_friendly = has_pet_friendly;
    }

    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sort_by]: sort_order },
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return {
      items: hotels,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.prisma.hotel.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }

  async update(
    id: string,
    updateHotelDto: UpdateHotelDto,
    userId: string,
  ): Promise<Hotel> {
    const existingHotel = await this.findOne(id);

    try {
      const hotel = await this.prisma.hotel.update({
        where: { id },
        data: {
          ...updateHotelDto,
          updated_by_id: userId,
        },
      });

      return hotel;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Hotel with this name and location already exists',
          );
        }
      }
      throw error;
    }
  }

  //   async remove(id: string, userId: string): Promise<void> {
  //     const existingHotel = await this.findOne(id);

  //     await this.prisma.hotel.update({
  //       where: { id },
  //       data: {
  //         deleted_at: new Date(),
  //         deleted_by_id: userId,
  //         status: 'DELETE',
  //       },
  //     });
  //   }
  async deleteHotel(id: string, req: any): Promise<Hotel> {
    const currentUser = await this.userService.getAuthenticatedUser(req);
    const existingHotel = await this.prisma.hotel.findFirst({
      where: { id: id, deleted_at: null },
    });
    if (!existingHotel) {
      throw new NotFoundException('Hotel does not exist');
    }

    const deletedHotel = await this.prisma.hotel.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: currentUser.id,
        status: Status.DELETE,
      },
    });

    return deletedHotel;
  }

  async getPopularHotels(limit: number = 6): Promise<PaginatedResponse<Hotel>> {
    const hotels = await this.prisma.hotel.findMany({
      where: {
        deleted_at: null,
        status: 'ACTIVE',
      },
      orderBy: [
        { rating: 'desc' },
        { star_rating: 'desc' },
        { created_at: 'desc' },
      ],
      take: limit,
    });

      return {
        items: hotels,
        total: hotels.length,
        page: 1,
        limit: hotels.length,
      };
  }

  async getHotelsByLocation(
    city: string,
    limit: number = 10,
  ): Promise<Hotel[]> {
    const hotels = await this.prisma.hotel.findMany({
      where: {
        city: { contains: city, mode: 'insensitive' },
        deleted_at: null,
        status: 'ACTIVE',
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });

    return hotels;
  }

  async getHotelsByPriceRange(
    minPrice: number,
    maxPrice: number,
    limit: number = 10,
  ): Promise<Hotel[]> {
    const hotels = await this.prisma.hotel.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        deleted_at: null,
        status: 'ACTIVE',
      },
      orderBy: { price: 'asc' },
      take: limit,
    });

    return hotels;
  }

  async getHotelsByAmenities(
    amenities: string[],
    limit: number = 10,
  ): Promise<Hotel[]> {
    const where: Prisma.HotelWhereInput = {
      deleted_at: null,
      status: 'ACTIVE',
    };

    // Build dynamic where conditions for amenities
    const amenityConditions: Prisma.HotelWhereInput[] = [];

    if (amenities.includes('wifi')) {
      amenityConditions.push({ has_wifi: true });
    }
    if (amenities.includes('pool')) {
      amenityConditions.push({ has_pool: true });
    }
    if (amenities.includes('spa')) {
      amenityConditions.push({ has_spa: true });
    }
    if (amenities.includes('gym')) {
      amenityConditions.push({ has_gym: true });
    }
    if (amenities.includes('restaurant')) {
      amenityConditions.push({ has_restaurant: true });
    }
    if (amenities.includes('parking')) {
      amenityConditions.push({ has_parking: true });
    }
    if (amenities.includes('pet_friendly')) {
      amenityConditions.push({ has_pet_friendly: true });
    }

    if (amenityConditions.length > 0) {
      where.AND = amenityConditions;
    }

    const hotels = await this.prisma.hotel.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: limit,
    });

    return hotels;
  }
}
