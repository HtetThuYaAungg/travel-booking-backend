import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/exceptions/http-exception';
import { PrismaExceptionFilter } from 'prisma/prisma-exception.filter';
import { writeFileSync } from 'fs';

const jwtTokenName = 'jwt';

const getCorsOrigins = (): string[] => {
  const envMode = process.env.NODE_ENV?.trim();

  if (envMode === 'production') {
    const prodUrl = process.env.PRODUCTION_URL as string;
    return [prodUrl];
  } else if (envMode === 'staging') {
    const stagingUrl = process.env.STAGING_URL as string;
    return [stagingUrl];
  } else {
    const devUrls = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.DEVELOPMENT_URL,
    ].filter(Boolean) as string[];
    return devUrls;
  }
};

const configureCors = (app: INestApplication<any>) => {
  app.enableCors({
    origin: getCorsOrigins(),
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
};

const configureGlobalSettings = (app: INestApplication<any>) => {
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useLogger(new Logger());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
};

const configureSwagger = (app: INestApplication<any>) => {
  // Only enable Swagger in development environment
  const envMode = process.env.NODE_ENV?.trim();

  if (envMode === 'development' || envMode === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Travel Booking API Documentation')
      .setDescription('API documentation for Travel Booking')
      .setVersion('1.0')
      .addBearerAuth(
        {
          description: `[just text field] Please enter token in following format: Bearer <JWT>`,
          name: 'Authorization',
          bearerFormat: 'Bearer',
          scheme: 'Bearer',
          type: 'http',
          in: 'Header',
        },
        jwtTokenName,
      )
      .addSecurityRequirements(jwtTokenName)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
    SwaggerModule.setup('swagger', app, document);

    console.log('Swagger UI enabled at /swagger');
  } else {
    console.log('Swagger UI disabled in production/staging environment');
  }
};

const startApplication = async (app: INestApplication<any>) => {
  const PORT = process.env.PORT || 3002;
  try {
    await app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.log('Connection failed', error);
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureCors(app);
  configureGlobalSettings(app);
  configureSwagger(app);
  await startApplication(app);
}

bootstrap();
