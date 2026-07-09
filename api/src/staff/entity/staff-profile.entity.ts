import { Profile } from '@/user/entity/profile.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('staffs_profile')
export class StaffProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  staffId!: string;

  @OneToOne(() => Profile, (profile) => profile.staffProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile!: Profile;

  @DeleteDateColumn()
  deletedAt?: Date;
}
