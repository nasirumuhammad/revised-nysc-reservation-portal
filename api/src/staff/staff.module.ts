import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffProfile } from './entity/staff-profile.entity';
import { User } from '@/user/entity/user.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StaffProfile, User])],
  providers: [StaffService],
  controllers: [StaffController],
})
export class StaffModule {}
