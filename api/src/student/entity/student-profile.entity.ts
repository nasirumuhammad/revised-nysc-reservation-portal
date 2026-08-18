import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassOfDegree, Gender } from '@/common/enums';
import { Marital_status } from '@/enums';
import { Profile } from '@/user/entity/profile.entity';
import { Department } from '@/department/entity/department.dto';

@Entity('students_profile')
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ClassOfDegree })
  classOfDegree!: ClassOfDegree;

  @Column({ type: 'date' })
  dateOfGraduation!: Date;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({ type: 'enum', enum: Gender })
  gender!: Gender;

  @Column({ type: 'enum', enum: Marital_status })
  maritalStatus!: Marital_status;

  @Column({ type: 'varchar', length: 50, unique: true })
  jambRegNumber!: string;

  @Column({ type: 'boolean', default: false })
  isMilitary!: boolean;

  @Column({ type: 'varchar', length: 100 })
  stateOfOrigin!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  registrationNumber!: string;

  @OneToOne(() => Profile, (profile) => profile.studentProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile!: Profile;

  @ManyToOne(() => Department, (department) => department.profiles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  department?: Department;

  @DeleteDateColumn()
  deletedAt?: Date;
}
