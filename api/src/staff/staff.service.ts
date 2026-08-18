import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { StaffProfile } from './entity/staff-profile.entity';
import { Profile } from '@/user/entity/profile.entity';
import { User } from '@/user/entity/user.entity';
import { Role } from '@/common/enums';
import { PaginatedQueryDto } from '@/common/dto/paginated-query.dto';
import { PaginatedResult } from '@/common/types/paginated-result.type';
import { CsvRowError } from '@/common/types/csv-error.type';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffRecord } from './types/staff-record.type';
import { HashingService } from '@/common/services/hash.service';
import { UpdateStaffDto } from './dto/update-staff.dto';

const CSV_TEMPLATE_HEADERS = [
  'firstName',
  'middleName',
  'surname',
  'email',
  'staffId',
] as const;

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffProfile)
    private readonly staffRepo: Repository<StaffProfile>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly datasource: DataSource,
    private readonly hashingService: HashingService,
  ) {}

  async findAll(
    query: PaginatedQueryDto,
  ): Promise<PaginatedResult<StaffRecord>> {
    const { search, page, limit } = query;

    const qb = this.staffRepo
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('profile.surname', 'ASC');

    if (search) {
      qb.andWhere(
        `(profile.firstName ILIKE :search
          OR profile.surname ILIKE :search
          OR user.email ILIKE :search
          OR staff.staffId ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [rows, total] = await qb.getManyAndCount();

    return {
      items: rows.map((row) => this.toRecord(row)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateStaffDto): Promise<StaffRecord> {
    return this.datasource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const hashedPassword = await this.hashingService.hash(
        dto.password || dto.staffId,
      );

      const user = manager.create(User, {
        email: dto.email,
        password: hashedPassword,
        role: Role.STAFF,
      });
      await manager.save(user);

      const profile = manager.create(Profile, {
        firstName: dto.firstName,
        middleName: dto.middleName,
        surname: dto.surname,
        user,
      });
      await manager.save(profile);

      const staffProfile = manager.create(StaffProfile, {
        staffId: dto.staffId,
        profile,
      });
      await manager.save(staffProfile);

      return this.toRecord({ ...staffProfile, profile: { ...profile, user } });
    });
  }

  async remove(id: string): Promise<void> {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: { profile: { user: true } },
    });
    if (!staff) {
      throw new NotFoundException('Staff record not found');
    }
    await this.userRepo.delete(staff.profile.user.id);
  }

  async bulkRemove(ids: string[]): Promise<{ deleted: number }> {
    const staffMembers = await this.staffRepo.find({
      where: { id: In(ids) },
      relations: { profile: { user: true } },
    });

    if (staffMembers.length === 0) {
      return { deleted: 0 };
    }

    const userIds = staffMembers.map((staff) => staff.profile.user.id);
    const result = await this.userRepo.delete({ id: In(userIds) });
    return { deleted: result.affected ?? 0 };
  }

  generateCsvTemplate(): string {
    return CSV_TEMPLATE_HEADERS.join(',') + '\n';
  }

  async bulkCreate(
    rows: { row: number; dto: CreateStaffDto }[],
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
      return 'A record with this email or staff ID already exists';
    }
    return 'Failed to create record';
  }

  private toRecord(staff: StaffProfile): StaffRecord {
    return {
      id: staff.id,
      firstName: staff.profile.firstName,
      middleName: staff.profile.middleName,
      surname: staff.profile.surname,
      email: staff.profile.user.email,
      staffId: staff.staffId,
    };
  }

  async update(id: string, dto: UpdateStaffDto): Promise<StaffRecord> {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: { profile: { user: true } },
    });
    if (!staff) {
      throw new NotFoundException('Staff record not found');
    }

    return this.datasource.transaction(async (manager) => {
      if (dto.email && dto.email !== staff.profile.user.email) {
        const existingUser = await manager.findOne(User, {
          where: { email: dto.email },
        });
        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
        staff.profile.user.email = dto.email;
      }

      if (dto.password) {
        staff.profile.user.password = await this.hashingService.hash(
          dto.password,
        );
        staff.profile.user.tokenVersion += 1;
      }

      await manager.save(staff.profile.user);

      if (dto.firstName !== undefined) staff.profile.firstName = dto.firstName;
      if (dto.middleName !== undefined)
        staff.profile.middleName = dto.middleName;
      if (dto.surname !== undefined) staff.profile.surname = dto.surname;
      await manager.save(staff.profile);

      if (dto.staffId !== undefined) staff.staffId = dto.staffId;
      await manager.save(staff);

      return this.toRecord(staff);
    });
  }
}
