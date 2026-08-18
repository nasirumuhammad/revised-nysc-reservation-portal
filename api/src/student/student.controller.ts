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
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedQueryDto } from '@/common/dto/paginated-query.dto';
import { BulkDeleteDto } from '@/common/dto/bulk-delete.dto';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { csvMulterOptions } from '@/common/configs/multer-csv.config';
import { parseAndValidateCsv } from '@/common/utils/csv-parser.util';

import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { User } from '@/user/entity/user.entity';

@UseGuards(JwtGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  findAll(@Query() query: PaginatedQueryDto) {
    return this.studentService.findAll(query);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Get('me')
  findMe(@Request() req: { user: User }) {
    return this.studentService.findByUserId(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @Post('bulk-delete')
  bulkRemove(@Body() payload: BulkDeleteDto) {
    return this.studentService.bulkRemove(payload.ids);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('csv-template')
  downloadTemplate(@Res() res: Response): void {
    const csv = this.studentService.generateCsvTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="student-upload-template.csv"',
    );
    res.send(csv);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file', csvMulterOptions))
  async bulkUpload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    const { valid, errors: validationErrors } = await parseAndValidateCsv(
      file.buffer,
      CreateStudentDto,
    );
    const { created, errors: creationErrors } =
      await this.studentService.bulkCreate(valid);

    return { created, errors: [...validationErrors, ...creationErrors] };
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }
}
