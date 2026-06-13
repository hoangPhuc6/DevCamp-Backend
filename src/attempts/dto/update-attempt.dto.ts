import { IsString, IsOptional, IsIn } from 'class-validator';
export class UpdateAttemptDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  @IsIn(['in progress', 'completed', 'failed'])
  status?: string;
}
