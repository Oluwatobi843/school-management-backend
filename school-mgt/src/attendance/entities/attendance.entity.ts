import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Student } from '../../student/entities/student.entity';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../auth/entities/user.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum AttendanceSyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

@Entity('attendance')
@Index(['student', 'date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne(() => Student, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Index()
  @ManyToOne(() => Class, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @Index()
  @Column({
    type: 'date',
  })
  date!: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status!: AttendanceStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  remark?: string;

  @Index()
  @ManyToOne(() => User, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'recordedById' })
  recordedBy!: User;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalReference?: string;

  @Column({
    type: 'enum',
    enum: AttendanceSyncStatus,
    default: AttendanceSyncStatus.PENDING,
  })
  syncStatus!: AttendanceSyncStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  syncedAt?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  syncError?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
