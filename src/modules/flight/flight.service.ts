import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightFilterDto } from './dto/flight-filter.dto';
import { FlightEntity } from './entities/flight.entity';
import { Flight, Prisma } from '@prisma/client';

@Injectable()
export class FlightService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFlightDto: CreateFlightDto, userId: string): Promise<FlightEntity> {
    // Validate departure and arrival times
    const departureTime = new Date(createFlightDto.departure_time);
    const arrivalTime = new Date(createFlightDto.arrival_time);

    if (departureTime >= arrivalTime) {
      throw new BadRequestException('Arrival time must be after departure time');
    }

    // Calculate duration if not provided or validate if provided
    const calculatedDuration = Math.round((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60));
    if (createFlightDto.duration_minutes !== calculatedDuration) {
      createFlightDto.duration_minutes = calculatedDuration;
    }

    const flight = await this.prisma.flight.create({
      data: {
        ...createFlightDto,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        created_by_id: userId,
      },
    });

    return new FlightEntity(flight);
  }

  async findAll(filterDto: FlightFilterDto): Promise<{ items: FlightEntity[]; total: number; page: number; limit: number }> {
    const {
      search,
      departure_airport_code,
      arrival_airport_code,
      departure_city,
      arrival_city,
      airline_name,
      airline_code,
      departure_date,
      min_price,
      max_price,
      class_type,
      has_wifi,
      has_meal,
      is_domestic,
      min_available_seats,
      status,
      page = 1,
      limit = 10,
      sort_by = 'departure_time',
      sort_order = 'asc',
    } = filterDto;

    const where: Prisma.FlightWhereInput = {
      deleted_at: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { flight_number: { contains: search, mode: 'insensitive' } },
        { airline_name: { contains: search, mode: 'insensitive' } },
        { departure_airport_code: { contains: search, mode: 'insensitive' } },
        { arrival_airport_code: { contains: search, mode: 'insensitive' } },
        { departure_city: { contains: search, mode: 'insensitive' } },
        { arrival_city: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Airport filters
    if (departure_airport_code) {
      where.departure_airport_code = { contains: departure_airport_code, mode: 'insensitive' };
    }
    if (arrival_airport_code) {
      where.arrival_airport_code = { contains: arrival_airport_code, mode: 'insensitive' };
    }

    // City filters
    if (departure_city) {
      where.departure_city = { contains: departure_city, mode: 'insensitive' };
    }
    if (arrival_city) {
      where.arrival_city = { contains: arrival_city, mode: 'insensitive' };
    }

    // Airline filters
    if (airline_name) {
      where.airline_name = { contains: airline_name, mode: 'insensitive' };
    }
    if (airline_code) {
      where.airline_code = { contains: airline_code, mode: 'insensitive' };
    }

    // Date filter
    if (departure_date) {
      const startDate = new Date(departure_date);
      const endDate = new Date(departure_date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.departure_time = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Price filters
    if (min_price !== undefined && max_price !== undefined) {
      where.base_price = { gte: min_price, lte: max_price };
    } else if (min_price !== undefined) {
      where.base_price = { gte: min_price };
    } else if (max_price !== undefined) {
      where.base_price = { lte: max_price };
    }

    // Feature filters
    if (class_type) {
      where.class_type = { contains: class_type, mode: 'insensitive' };
    }
    if (has_wifi !== undefined) {
      where.has_wifi = has_wifi;
    }
    if (has_meal !== undefined) {
      where.has_meal = has_meal;
    }
    if (is_domestic !== undefined) {
      where.is_domestic = is_domestic;
    }

    // Availability filter
    if (min_available_seats !== undefined) {
      where.available_seats = { gte: min_available_seats };
    }

    // Status filter
    if (status) {
      where.status = status as any;
    }

    // Sorting
    const orderBy: Prisma.FlightOrderByWithRelationInput = {};
    if (sort_by === 'price') {
      orderBy.base_price = sort_order;
    } else if (sort_by === 'duration') {
      orderBy.duration_minutes = sort_order;
    } else if (sort_by === 'airline') {
      orderBy.airline_name = sort_order;
    } else {
      orderBy.departure_time = sort_order;
    }

    const skip = (page - 1) * limit;

    const [flights, total] = await Promise.all([
      this.prisma.flight.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.flight.count({ where }),
    ]);

    return {
      items: flights.map(flight => new FlightEntity(flight)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FlightEntity> {
    const flight = await this.prisma.flight.findFirst({
      where: { id, deleted_at: null },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    return new FlightEntity(flight);
  }

  async update(id: string, updateFlightDto: UpdateFlightDto, userId: string): Promise<FlightEntity> {
    const existingFlight = await this.prisma.flight.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existingFlight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    // Validate times if provided
    if (updateFlightDto.departure_time || updateFlightDto.arrival_time) {
      const departureTime = updateFlightDto.departure_time 
        ? new Date(updateFlightDto.departure_time)
        : existingFlight.departure_time;
      const arrivalTime = updateFlightDto.arrival_time 
        ? new Date(updateFlightDto.arrival_time)
        : existingFlight.arrival_time;

      if (departureTime >= arrivalTime) {
        throw new BadRequestException('Arrival time must be after departure time');
      }

      // Update duration if times changed
      if (updateFlightDto.departure_time || updateFlightDto.arrival_time) {
        updateFlightDto.duration_minutes = Math.round((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60));
      }
    }

    const flight = await this.prisma.flight.update({
      where: { id },
      data: {
        ...updateFlightDto,
        updated_by_id: userId,
      },
    });

    return new FlightEntity(flight);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingFlight = await this.prisma.flight.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existingFlight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    await this.prisma.flight.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: userId,
      },
    });
  }

  async searchFlights(
    departureAirport: string,
    arrivalAirport: string,
    departureDate: string,
    passengers: number = 1,
    returnDate?: string
  ): Promise<{ flights: FlightEntity[]; returnFlights?: FlightEntity[] }> {
    const startDate = new Date(departureDate);
    const endDate = new Date(departureDate);
    endDate.setDate(endDate.getDate() + 1);

    const where: Prisma.FlightWhereInput = {
      deleted_at: null,
      departure_airport_code: { contains: departureAirport, mode: 'insensitive' },
      arrival_airport_code: { contains: arrivalAirport, mode: 'insensitive' },
      departure_time: {
        gte: startDate,
        lt: endDate,
      },
      available_seats: { gte: passengers },
    };

    const flights = await this.prisma.flight.findMany({
      where,
      orderBy: { departure_time: 'asc' },
    });

    let returnFlights: FlightEntity[] = [];

    if (returnDate) {
      const returnStartDate = new Date(returnDate);
      const returnEndDate = new Date(returnDate);
      returnEndDate.setDate(returnEndDate.getDate() + 1);

      const returnWhere: Prisma.FlightWhereInput = {
        ...where,
        departure_airport_code: { contains: arrivalAirport, mode: 'insensitive' },
        arrival_airport_code: { contains: departureAirport, mode: 'insensitive' },
        departure_time: {
          gte: returnStartDate,
          lt: returnEndDate,
        },
      };

      const returnFlightsData = await this.prisma.flight.findMany({
        where: returnWhere,
        orderBy: { departure_time: 'asc' },
      });

      returnFlights = returnFlightsData.map(flight => new FlightEntity(flight));
    }

    return {
      flights: flights.map(flight => new FlightEntity(flight)),
      returnFlights: returnFlights.length > 0 ? returnFlights : undefined,
    };
  }

  async getAvailableAirlines(): Promise<string[]> {
    const airlines = await this.prisma.flight.findMany({
      where: { deleted_at: null },
      select: { airline_name: true },
      distinct: ['airline_name'],
      orderBy: { airline_name: 'asc' },
    });

    return airlines.map(airline => airline.airline_name);
  }

  async getPopularRoutes(): Promise<Array<{ route: string; count: number }>> {
    const routes = await this.prisma.flight.groupBy({
      by: ['departure_airport_code', 'arrival_airport_code'],
      where: { deleted_at: null },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return routes.map(route => ({
      route: `${route.departure_airport_code} → ${route.arrival_airport_code}`,
      count: route._count.id,
    }));
  }
}
