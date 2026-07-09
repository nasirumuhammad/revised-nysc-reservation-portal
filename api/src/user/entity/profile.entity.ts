import { StudentProfile } from '@/student/entity/student-profile.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { StaffProfile } from '@/staff/entity/staff-profile.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middleName?: string;

  @Column({ type: 'varchar', length: 255 })
  surname!: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToOne(() => StudentProfile, (studentProfile) => studentProfile.profile)
  studentProfile?: StudentProfile;

  @OneToOne(() => StaffProfile, (staffProfile) => staffProfile.profile)
  staffProfile?: StaffProfile;

  @DeleteDateColumn()
  deletedAt?: Date;
}
