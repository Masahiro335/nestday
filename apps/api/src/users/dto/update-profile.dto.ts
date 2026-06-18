import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  memo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}
