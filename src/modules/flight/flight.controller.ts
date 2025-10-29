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
import { FlightService } from './flight.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightFilterDto } from './dto/flight-filter.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { Flight } from '@prisma/client';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public';

@ApiTags('Flights')
@Controller('flights')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({ status: 201, description: 'Flight created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Permission('flights:create')
  async create(@Body() createFlightDto: CreateFlightDto, @Request() req) {
    return this.flightService.create(createFlightDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flights with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully' })
  @Public()
  async findAll(@Query() filterDto: FlightFilterDto) {
    return this.flightService.findAll(filterDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search flights by route and date' })
  @ApiResponse({ status: 200, description: 'Flight search results' })
  @Public()
  @ApiQuery({ name: 'departure', description: 'Departure airport code' })
  @ApiQuery({ name: 'arrival', description: 'Arrival airport code' })
  @ApiQuery({ name: 'date', description: 'Departure date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'passengers', description: 'Number of passengers', required: false })
  @ApiQuery({ name: 'returnDate', description: 'Return date for round-trip', required: false })
  async searchFlights(
    @Query('departure') departure: string,
    @Query('arrival') arrival: string,
    @Query('date') date: string,
    @Query('passengers') passengers?: number,
    @Query('returnDate') returnDate?: string,
  ) {
    return this.flightService.searchFlights(departure, arrival, date, passengers, returnDate);
  }

  @Get('airlines')
  @ApiOperation({ summary: 'Get list of available airlines' })
  @ApiResponse({ status: 200, description: 'Airlines retrieved successfully' })
  @Public()
  async getAirlines() {
    return this.flightService.getAvailableAirlines();
  }

  @Get('popular-routes')
  @ApiOperation({ summary: 'Get popular flight routes' })
  @ApiResponse({ status: 200, description: 'Popular routes retrieved successfully' })
  @Public()
  async getPopularRoutes() {
    return this.flightService.getPopularRoutes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight by ID' })
  @ApiResponse({ status: 200, description: 'Flight retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @Public()
  async findOne(@Param('id') id: string) {
    return this.flightService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight' })
  @ApiResponse({ status: 200, description: 'Flight updated successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @Permission('flights:edit')
  async update(@Param('id') id: string, @Body() updateFlightDto: UpdateFlightDto, @Request() req) {
    return this.flightService.update(id, updateFlightDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flight' })
  @ApiResponse({ status: 204, description: 'Flight deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @Permission('flights:delete')
  async remove(@Param('id') id: string, @Request() req) {
    return this.flightService.remove(id, req.user.id);
  }
}
