import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { Request } from 'express';

export const csvMulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const isCsv =
      file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    if (!isCsv) {
      return callback(
        new BadRequestException('Only CSV files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
};
