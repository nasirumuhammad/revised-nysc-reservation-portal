import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { EmailModule } from './email/email.module';
import { GlobalConfigModule } from './common/modules/global.module';
import { StudentModule } from './student/student.module';
import { DepartmentModule } from './department/department.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [
    GlobalConfigModule,
    UserModule,
    CommonModule,
    EmailModule,
    AuthModule,
    StudentModule,
    DepartmentModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
