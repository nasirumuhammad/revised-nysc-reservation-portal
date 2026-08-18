import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => String(value).trim())
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => (value ? String(value).trim() : value))
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => String(value).trim())
  surname!: string;

  @IsEmail()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => String(value).trim().toUpperCase())
  staffId!: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Transform(({ value }) => (value ? String(value).trim() : value))
  password?: string;
}
