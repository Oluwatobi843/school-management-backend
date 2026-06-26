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

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  employeeId!: string;

  @OneToOne(() => User, (user) => user.teacher, {
    eager: true,
  })
  @JoinColumn()
  user!: User;


  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender!: Gender;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  qualification!: string;

  @Column()
  specialization!: string;

  @Column({ type: 'date' })
  hireDate!: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}