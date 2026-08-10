import { Exclude } from 'class-transformer';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column({ nullable: true })
  password!: string | null;

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
    nullable: true,
    unique: true,
  })
  googleId!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacher!: Teacher;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}