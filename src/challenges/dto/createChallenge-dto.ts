import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class TestCaseDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  id!: number;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  input!: string;

  @IsString()
  expected_output!: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  problem_name!: string;

  @IsOptional()
  @IsString()
  type!: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  modules!: number;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsIn(['easy', 'medium', 'hard'])
  difficulty!: 'easy' | 'medium' | 'hard';

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(['coding', 'multiple_choice'])
  challengeType!: 'coding' | 'multiple_choice';

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  test_cases!: TestCaseDto[];
}
