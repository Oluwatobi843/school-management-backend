import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Subject } from '../../subjects/entities/subject.entity';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
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

  @Column({
    type: 'date',
  })
  dateOfBirth!: Date;

  @Column({
    nullable: true,
  })
  phone?: string;

  @Column({
    nullable: true,
  })
  profileImage?: string;

  @Column()
  qualification!: string;

  @Column()
  specialization!: string;

  @Column({
    type: 'date',
  })
  hireDate!: Date;

  @ManyToMany(() => Subject, (subject) => subject.teachers, {
    eager: true,
  })
  @JoinTable({
    name: 'teacher_subjects',
  })
  subjects!: Subject[];

  @Column({
    nullable: true,
  })
  address?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
