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
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelFilterDto } from './dto/hotel-filter.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { PaginatedResponse } from 'src/common/interceptors/response.interceptor';
import { Hotel } from '@prisma/client';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public';

@ApiTags('Hotels')
@Controller('hotels')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hotel (Admin only)' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Permission('hotels:create')
  async create(
    @Body() createHotelDto: CreateHotelDto,
    @Request() req,
  ): Promise<Hotel> {
    return this.hotelService.create(createHotelDto, req.user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all hotels with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Hotels retrieved successfully' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, location, or city',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filter by country',
  })
  @ApiQuery({
    name: 'min_price',
    required: false,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'max_price',
    required: false,
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'min_star_rating',
    required: false,
    description: 'Minimum star rating',
  })
  @ApiQuery({
    name: 'min_rating',
    required: false,
    description: 'Minimum rating',
  })
  @ApiQuery({ name: 'has_wifi', required: false, description: 'Has WiFi' })
  @ApiQuery({ name: 'has_pool', required: false, description: 'Has Pool' })
  @ApiQuery({ name: 'has_spa', required: false, description: 'Has Spa' })
  @ApiQuery({ name: 'has_gym', required: false, description: 'Has Gym' })
  @ApiQuery({
    name: 'has_restaurant',
    required: false,
    description: 'Has Restaurant',
  })
  @ApiQuery({
    name: 'has_parking',
    required: false,
    description: 'Has Parking',
  })
  @ApiQuery({
    name: 'has_pet_friendly',
    required: false,
    description: 'Pet Friendly',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order' })
  async findAll(
    @Query() filters: HotelFilterDto,
  ): Promise<PaginatedResponse<Hotel>> {
    return this.hotelService.findAll(filters);
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular hotels' })
  @ApiResponse({
    status: 200,
    description: 'Popular hotels retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of hotels to return',
  })
  async getPopularHotels(@Query('limit') limit?: number) {
    return this.hotelService.getPopularHotels(limit);
  }

  @Get('location/:city')
  @Permission('hotels:list')
  @ApiOperation({ summary: 'Get hotels by city' })
  @ApiResponse({ status: 200, description: 'Hotels retrieved successfully' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of hotels to return',
  })
  async getHotelsByLocation(
    @Param('city') city: string,
    @Query('limit') limit?: number,
  ) {
    return this.hotelService.getHotelsByLocation(city, limit);
  }

  @Get('price-range')
  @Permission('hotels:list')
  @ApiOperation({ summary: 'Get hotels by price range' })
  @ApiResponse({ status: 200, description: 'Hotels retrieved successfully' })
  @ApiQuery({ name: 'min_price', required: true, description: 'Minimum price' })
  @ApiQuery({ name: 'max_price', required: true, description: 'Maximum price' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of hotels to return',
  })
  async getHotelsByPriceRange(
    @Query('min_price') minPrice: number,
    @Query('max_price') maxPrice: number,
    @Query('limit') limit?: number,
  ) {
    return this.hotelService.getHotelsByPriceRange(minPrice, maxPrice, limit);
  }

  @Get('amenities')
  @Permission('hotels:list')
  @ApiOperation({ summary: 'Get hotels by amenities' })
  @ApiResponse({ status: 200, description: 'Hotels retrieved successfully' })
  @ApiQuery({
    name: 'amenities',
    required: true,
    description: 'Comma-separated list of amenities',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of hotels to return',
  })
  async getHotelsByAmenities(
    @Query('amenities') amenities: string,
    @Query('limit') limit?: number,
  ) {
    const amenitiesList = amenities.split(',').map((a) => a.trim());
    return this.hotelService.getHotelsByAmenities(amenitiesList, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get hotel by ID' })
  @ApiResponse({ status: 200, description: 'Hotel retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async findOne(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hotel (Admin only)' })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Permission('hotels:edit')
  async update(
    @Param('id') id: string,
    @Body() updateHotelDto: UpdateHotelDto,
    @Request() req,
  ): Promise<Hotel> {
    return this.hotelService.update(id, updateHotelDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hotel (Admin only)' })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Permission('hotels:delete')
  async deleteHotel(@Param('id') id: string, @Request() req): Promise<Hotel> {
    return this.hotelService.deleteHotel(id, req);
  }
}
