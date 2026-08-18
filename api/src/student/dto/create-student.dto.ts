import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ClassOfDegree, Gender } from '@/common/enums';
import { Marital_status } from '@/enums';

export class CreateStudentDto {
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

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Marital_status)
  maritalStatus!: Marital_status;

  @IsEnum(ClassOfDegree)
  classOfDegree!: ClassOfDegree;

  @IsDateString()
  dateOfGraduation!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => String(value).trim().toUpperCase())
  jambRegNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => String(value).trim().toUpperCase())
  registrationNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  stateOfOrigin!: string;

  @IsBoolean()
  @Transform(({ value }) => String(value).trim().toLowerCase() === 'true')
  isMilitary!: boolean;
}