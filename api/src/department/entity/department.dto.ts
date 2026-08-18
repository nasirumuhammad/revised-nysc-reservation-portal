import { StudentProfile } from '@/student/entity/student-profile.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @OneToMany(
    () => StudentProfile,
    (studentProfile) => studentProfile.department,
  )
  profiles!: StudentProfile[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
