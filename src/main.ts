import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan'; // HTTP status log
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Tự động convert plain object từ request thành DTO class
      whitelist: true, // Tự động lọc bỏ các field thừa không được định nghĩa trong DTO
    }),
  );
  app.use(morgan('dev')); // define use of morgan middleware
  await app.listen(process.env.PORT ?? 3000);
}
console.log('Server is running on port', process.env.PORT ?? 3000);
bootstrap().catch(console.error);
