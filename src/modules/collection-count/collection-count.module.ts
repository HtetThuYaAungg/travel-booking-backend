import { Module } from '@nestjs/common';

import { CollectionCountController } from './collection-count.controller';
import { CollectionCountService } from './collection-count.service';

@Module({
  controllers: [CollectionCountController],
  providers: [CollectionCountService],
})
export class CollectionCountModule {}
