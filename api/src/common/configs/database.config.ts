import { RefreshToken } from '@/refresh-token/entity/refresh-token.entity';
import { StaffProfile } from '@/staff/entity/staff-profile.entity';
import { StudentProfile } from '@/student/entity/student-profile.entity';
import { Profile } from '@/user/entity/profile.entity';
import { User } from '@/user/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const dbConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory(configService: ConfigService) {
    const username = configService.getOrThrow('DB_USERNAME');
    const password = configService.getOrThrow('DB_PASSWORD');
    const database = configService.getOrThrow('DB_NAME');
    const host = configService.getOrThrow('DB_HOST');
    const port = configService.getOrThrow('DB_PORT');
    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [User, RefreshToken, StudentProfile, StaffProfile, Profile],
      synchronize: true,
      autoLoadEntities: true,
    };
  },
};
