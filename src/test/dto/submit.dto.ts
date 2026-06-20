import { IsArray, IsMongoId, IsString } from 'class-validator';

export class SubmitAssessmentDto {
  @IsMongoId()
  challengeId: string;

  @IsArray()
  @IsString({ each: true })
  userCodeOutput: string[];
}
