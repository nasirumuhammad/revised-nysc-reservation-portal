import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { PaginatedQueryDto } from '@/common/dto/paginated-query.dto';
import { PaginatedResult } from '@/common/types/paginated-result.type';
import { CsvRowError } from '@/common/types/csv-error.type';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentRecord } from './types/department-record.type';
import { Department } from './entity/department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

const CSV_TEMPLATE_HEADERS = ['name'] as const;

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    private readonly datasource: DataSource,
  ) {}

  async findAll(
    query: PaginatedQueryDto,
  ): Promise<PaginatedResult<DepartmentRecord>> {
    const { search, page, limit } = query;

    const qb = this.departmentRepo
      .createQueryBuilder('department')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('department.name', 'ASC');

    if (search) {
      qb.andWhere('department.name ILIKE :search', { search: `%${search}%` });
    }

    const [rows, total] = await qb.getManyAndCount();

    return {
      items: rows.map((row) => this.toRecord(row)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentRecord> {
    const existing = await this.departmentRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A department with this name already exists');
    }

    const department = this.departmentRepo.create({ name: dto.name });
    await this.departmentRepo.save(department);
    return this.toRecord(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.departmentRepo.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    await this.departmentRepo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<{ deleted: number }> {
    const result = await this.departmentRepo.delete({ id: In(ids) });
    return { deleted: result.affected ?? 0 };
  }

  generateCsvTemplate(): string {
    return CSV_TEMPLATE_HEADERS.join(',') + '\n';
  }

  async bulkCreate(
    rows: { row: number; dto: CreateDepartmentDto }[],
  ): Promise<{ created: number; errors: CsvRowError[] }> {
    let created = 0;
    const errors: CsvRowError[] = [];

    for (const { row, dto } of rows) {
      try {
        await this.create(dto);
        created += 1;
      } catch (error: unknown) {
        errors.push({ row, errors: { name: [this.mapCreateError(error)] } });
      }
    }

    return { created, errors };
  }

  private mapCreateError(error: unknown): string {
    if (error instanceof ConflictException) return error.message;
    const pgError = error as { code?: string };
    if (pgError?.code === '23505') {
      return 'A department with this name already exists';
    }
    return 'Failed to create record';
  }

  private toRecord(department: Department): DepartmentRecord {
    return { id: department.id, name: department.name };
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentRecord> {
    const department = await this.departmentRepo.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (dto.name && dto.name !== department.name) {
      const existing = await this.departmentRepo.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          'A department with this name already exists',
        );
      }
      department.name = dto.name;
      await this.departmentRepo.save(department);
    }

    return this.toRecord(department);
  }
}
