import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan'; // HTTP status log
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev')); // define use of morgan middleware
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip non-whitelisted properties
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
console.log('Server is running on port', process.env.PORT ?? 3000);
bootstrap().catch(console.error);
