import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ChallengeService } from './challenges.service';
import { CreateChallengeDto } from './dto/createChallenge-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'; // import RoleGuard later

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post('create')
  // @Roles('admin') import role.guard.ts later
  // @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    return await this.challengeService.createChallenges(createChallengeDto);
  }

  // This static route should come before any dynamic routes.
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getChallengeAll() {
    return await this.challengeService.getChallengesAll();
  }

  // :slug is value in DB
  @Get(':slug/question')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getChallenge(@Param('slug') slug: string) {
    return await this.challengeService.getChallengeBySlug(slug);
  }
}
