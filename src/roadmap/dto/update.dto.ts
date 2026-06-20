import {
  IsMongoId,
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
} from 'class-validator';

export class UpdateRoadmapDto {
  @IsOptional()
  @IsMongoId()
  templateId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'completed', 'archived'])
  status?: string;

  @IsOptional()
  @IsNumber()
  completedNodes?: number;
}
