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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { csvMulterOptions } from '@/common/configs/multer-csv.config';
import { parseAndValidateCsv } from '@/common/utils/csv-parser.util';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(@Query() query: PaginatedQueryDto) {
    return this.staffService.findAll(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('bulk-delete')
  bulkRemove(@Body() payload: BulkDeleteDto) {
    return this.staffService.bulkRemove(payload.ids);
  }

  @Get('csv-template')
  downloadTemplate(@Res() res: Response): void {
    const csv = this.staffService.generateCsvTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="staff-upload-template.csv"',
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
      CreateStaffDto,
    );
    const { created, errors: creationErrors } =
      await this.staffService.bulkCreate(valid);

    return { created, errors: [...validationErrors, ...creationErrors] };
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }
}
