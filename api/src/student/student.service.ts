import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { StudentProfile } from './entity/student-profile.entity';
import { Profile } from '@/user/entity/profile.entity';
import { User } from '@/user/entity/user.entity';
import { Role } from '@/common/enums';
import { PaginatedQueryDto } from '@/common/dto/paginated-query.dto';
import { PaginatedResult } from '@/common/types/paginated-result.type';
import { CsvRowError } from '@/common/types/csv-error.type';
import { CreateStudentDto } from './dto/create-student.dto';
import { HashingService } from '@/common/services/hash.service';
import { StudentRecord } from '@/types/student-record.type';
import { UpdateStudentDto } from './dto/update-student.dto';

const CSV_TEMPLATE_HEADERS = [
  'firstName',
  'middleName',
  'surname',
  'email',
  'gender',
  'dateOfBirth',
  'maritalStatus',
  'classOfDegree',
  'dateOfGraduation',
  'jambRegNumber',
  'registrationNumber',
  'stateOfOrigin',
  'isMilitary',
] as const;

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentRepo: Repository<StudentProfile>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly datasource: DataSource,
    private readonly hashingService: HashingService,
  ) {}

  async findAll(
    query: PaginatedQueryDto,
  ): Promise<PaginatedResult<StudentRecord>> {
    const { search, page, limit } = query;

    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('profile.surname', 'ASC');

    if (search) {
      qb.andWhere(
        `(profile.firstName ILIKE :search
          OR profile.surname ILIKE :search
          OR user.email ILIKE :search
          OR student.registrationNumber ILIKE :search
          OR student.jambRegNumber ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [rows, total] = await qb.getManyAndCount();

    return {
      items: rows.map((row) => this.toRecord(row)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async remove(id: string): Promise<void> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: { profile: { user: true } },
    });
    if (!student) {
      throw new NotFoundException('Student record not found');
    }
    await this.userRepo.delete(student.profile.user.id);
  }

  async bulkRemove(ids: string[]): Promise<{ deleted: number }> {
    const students = await this.studentRepo.find({
      where: { id: In(ids) },
      relations: { profile: { user: true } },
    });

    if (students.length === 0) {
      return { deleted: 0 };
    }

    const userIds = students.map((student) => student.profile.user.id);
    const result = await this.userRepo.delete({ id: In(userIds) });
    return { deleted: result.affected ?? 0 };
  }

  generateCsvTemplate(): string {
    return CSV_TEMPLATE_HEADERS.join(',') + '\n';
  }

  async create(dto: CreateStudentDto): Promise<StudentRecord> {
    return this.datasource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const hashedPassword = await this.hashingService.hash(dto.stateOfOrigin);

      const user = manager.create(User, {
        email: dto.email,
        password: hashedPassword,
        role: Role.STUDENT,
      });
      await manager.save(user);

      const profile = manager.create(Profile, {
        firstName: dto.firstName,
        middleName: dto.middleName,
        surname: dto.surname,
        user,
      });
      await manager.save(profile);

      const studentProfile = manager.create(StudentProfile, {
        classOfDegree: dto.classOfDegree,
        dateOfGraduation: new Date(dto.dateOfGraduation),
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        jambRegNumber: dto.jambRegNumber,
        registrationNumber: dto.registrationNumber,
        stateOfOrigin: dto.stateOfOrigin,
        isMilitary: dto.isMilitary,
        profile,
      });
      await manager.save(studentProfile);

      return this.toRecord({
        ...studentProfile,
        profile: { ...profile, user },
      });
    });
  }

  async findByUserId(userId: string): Promise<StudentRecord> {
    const student = await this.studentRepo.findOne({
      where: { profile: { user: { id: userId } } },
      relations: { profile: { user: true } },
    });
    if (!student) {
      throw new NotFoundException('Student record not found');
    }

    return this.toRecord(student);
  }

  async bulkCreate(
    rows: { row: number; dto: CreateStudentDto }[],
  ): Promise<{ created: number; errors: CsvRowError[] }> {
    let created = 0;
    const errors: CsvRowError[] = [];

    for (const { row, dto } of rows) {
      try {
        await this.create(dto);
        created += 1;
      } catch (error: unknown) {
        errors.push({ row, errors: { email: [this.mapCreateError(error)] } });
      }
    }

    return { created, errors };
  }

  private mapCreateError(error: unknown): string {
    if (error instanceof ConflictException) return error.message;
    const pgError = error as { code?: string };
    if (pgError?.code === '23505') {
      return 'A record with this email or registration number already exists';
    }
    return 'Failed to create record';
  }

  private toRecord(student: StudentProfile): StudentRecord {
    return {
      id: student.id,
      firstName: student.profile.firstName,
      middleName: student.profile.middleName,
      surname: student.profile.surname,
      email: student.profile.user.email,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth.toString(),
      maritalStatus: student.maritalStatus,
      classOfDegree: student.classOfDegree,
      dateOfGraduation: student.dateOfGraduation.toString(),
      jambRegNumber: student.jambRegNumber,
      registrationNumber: student.registrationNumber,
      stateOfOrigin: student.stateOfOrigin,
      isMilitary: student.isMilitary,
    };
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentRecord> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: { profile: { user: true } },
    });
    if (!student) {
      throw new NotFoundException('Student record not found');
    }

    return this.datasource.transaction(async (manager) => {
      if (dto.email && dto.email !== student.profile.user.email) {
        const existingUser = await manager.findOne(User, {
          where: { email: dto.email },
        });
        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
        student.profile.user.email = dto.email;
      }

      if (dto.password) {
        student.profile.user.password = await this.hashingService.hash(
          dto.password,
        );
        student.profile.user.tokenVersion += 1; // invalidates existing sessions/refresh tokens
      }

      await manager.save(student.profile.user);

      if (dto.firstName !== undefined)
        student.profile.firstName = dto.firstName;
      if (dto.middleName !== undefined)
        student.profile.middleName = dto.middleName;
      if (dto.surname !== undefined) student.profile.surname = dto.surname;
      await manager.save(student.profile);

      if (dto.gender !== undefined) student.gender = dto.gender;
      if (dto.maritalStatus !== undefined)
        student.maritalStatus = dto.maritalStatus;
      if (dto.classOfDegree !== undefined)
        student.classOfDegree = dto.classOfDegree;
      if (dto.jambRegNumber !== undefined)
        student.jambRegNumber = dto.jambRegNumber;
      if (dto.registrationNumber !== undefined)
        student.registrationNumber = dto.registrationNumber;
      if (dto.stateOfOrigin !== undefined)
        student.stateOfOrigin = dto.stateOfOrigin;
      if (dto.isMilitary !== undefined) student.isMilitary = dto.isMilitary;
      if (dto.dateOfBirth !== undefined)
        student.dateOfBirth = new Date(dto.dateOfBirth);
      if (dto.dateOfGraduation !== undefined)
        student.dateOfGraduation = new Date(dto.dateOfGraduation);
      await manager.save(student);

      return this.toRecord(student);
    });
  }
}
