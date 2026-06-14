import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
import { TestModule } from './test/test.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/FESSIORDEVCAMP_BACKEND'),
    TestModule,
    RoadmapModule,
=======
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUrl'),
      }),
    }),
    UserModule,
    AuthModule,
>>>>>>> upstream/main
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
