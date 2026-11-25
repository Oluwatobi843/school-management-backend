import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { ProfileGender } from '../enums/profile-gender.enum';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
  })
  phoneNumber?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  profilePicture?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  @Column({
    type: 'enum',
    enum: ProfileGender,
    nullable: true,
  })
  gender?: ProfileGender;

  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  city?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  state?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  country?: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    unique: true,
  })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}