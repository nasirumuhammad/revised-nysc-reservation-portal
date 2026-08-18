import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from './entity/student-profile.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { User } from '@/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile, User])],
  providers: [StudentService],
  controllers: [StudentController],
})
export class StudentModule {}
