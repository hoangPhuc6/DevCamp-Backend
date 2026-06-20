import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateRoadmapDto } from './dto/update.dto';

@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get('me')
  getRoadmaps(@Request() req: any) {
    const userId = req.user.subject;
    return this.roadmapService.getRoadmaps(userId);
  }

  @Put('me')
  putRoadmaps(@Request() req: any, @Body() body: UpdateRoadmapDto) {
    const userId = req.user.subject;
    return this.roadmapService.putRoadmaps(userId, body);
  }
}
