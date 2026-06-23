import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import morgan from 'morgan'; // HTTP status log

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('CodeQuest API')
    .setDescription("API documentation for Backend DevCamp's project")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(morgan('dev')); // define use of morgan middleware
  await app.listen(process.env.PORT ?? 3000);
}
console.log('Server is running on port', process.env.PORT ?? 3000);
bootstrap().catch(console.error);
