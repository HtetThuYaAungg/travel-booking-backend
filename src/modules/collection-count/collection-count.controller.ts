import { Controller, Get } from '@nestjs/common';
import { CollectionCountService } from './collection-count.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('counts')
export class CollectionCountController {
  constructor(private readonly countService: CollectionCountService) {}

  @Get()
  @ApiOperation({ summary: 'Get counts for user,role and department' })
  async getAllCounts() {
    return this.countService.getAllCounts();
  }
}
