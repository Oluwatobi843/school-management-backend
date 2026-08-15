import {
  Column,
  CreateDateColumn,
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

@Entity('attendance')
@Index(['student', 'date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================
  // STUDENT
  // ============================

  @ManyToOne(() => Student, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  // ============================
  // CLASS
  // ============================

  @ManyToOne(() => Class, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classId' })
  class!: Class;

  // ============================
  // ATTENDANCE DATE
  // ============================

  @Column({
    type: 'date',
  })
  date!: Date;

  // ============================
  // STATUS
  // ============================

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status!: AttendanceStatus;

  // ============================
  // REMARK
  // ============================

  @Column({
    type: 'text',
    nullable: true,
  })
  remark?: string;

  // ============================
  // RECORDED BY
  // ADMIN / TEACHER
  // ============================

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'recordedById' })
  recordedBy!: User;

  // ============================
  // TIMESTAMPS
  // ============================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}