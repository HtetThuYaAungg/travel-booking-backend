//

import { Controller, Get, Res, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('swagger.json')
  async getJson(@Res() res: Response) {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder().setTitle('My API').build();
    const document = SwaggerModule.createDocument(app, config);
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
    return {
      message: 'Swagger JSON generated successfully',
    }
  }
}