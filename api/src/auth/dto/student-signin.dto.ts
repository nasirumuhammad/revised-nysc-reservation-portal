import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class StudentSignInDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => String(value).trim().toUpperCase())
  registrationNumber!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value).trim())
  password!: string;
}
