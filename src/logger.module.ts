import { Module, Global } from '@nestjs/common';
import { WinstonModule, WinstonLogger } from 'nest-winston';
import { winstonConfig } from './configurations/winston.config';

@Global() // Makes the module available globally
@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
  ],
  providers: [
    {
      provide: WinstonLogger,
      useFactory: (winstonInstance) => new WinstonLogger(winstonInstance),
      inject: ['winston'],
    },
  ],
  exports: [WinstonLogger],
})
export class LoggerModule {}