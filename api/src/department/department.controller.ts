import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { PaginatedQueryDto } from '@/common/dto/paginated-query.dto';
import { BulkDeleteDto } from '@/common/dto/bulk-delete.dto';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { parseAndValidateCsv } from '@/common/utils/csv-parser.util';
import { csvMulterOptions } from '@/common/configs/multer-csv.config';
import { UpdateDepartmentDto } from './dto/update-department.dto';

// @UseGuards(JwtGuard, RolesGuard)
// @Roles(Role.ADMIN)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  findAll(@Query() query: PaginatedQueryDto) {
    return this.departmentService.findAll(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('bulk-delete')
  bulkRemove(@Body() payload: BulkDeleteDto) {
    return this.departmentService.bulkRemove(payload.ids);
  }

  @Get('csv-template')
  downloadTemplate(@Res() res: Response): void {
    const csv = this.departmentService.generateCsvTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="department-upload-template.csv"',
    );
    res.send(csv);
  }

  @HttpCode(HttpStatus.OK)
  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file', csvMulterOptions))
  async bulkUpload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    const { valid, errors: validationErrors } = await parseAndValidateCsv(
      file.buffer,
      CreateDepartmentDto,
    );
    const { created, errors: creationErrors } =
      await this.departmentService.bulkCreate(valid);

    return { created, errors: [...validationErrors, ...creationErrors] };
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto);
  }
}
