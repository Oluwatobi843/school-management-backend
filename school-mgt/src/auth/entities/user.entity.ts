import { Exclude } from 'class-transformer';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from '../../student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Index()
  @Column({
    type: 'varchar',
    unique: true,
  })
  email!: string;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider!: AuthProvider;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId?: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacher!: Teacher;

  @OneToOne(() => Student, (student) => student.user)
  student!: Student;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
