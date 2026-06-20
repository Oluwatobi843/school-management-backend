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

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  employeeId!: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user!: User;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  gender!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column()
  phone!: string;

  @Column()
  qualification!: string;

  @Column()
  specialization!: string;

  @Column({ type: 'date' })
  hireDate!: Date;

  @Column({ nullable: true })
  address!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}