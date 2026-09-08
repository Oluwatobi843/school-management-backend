import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  OneToMany,
} from 'typeorm';

import { Class } from '../../classes/entities/class.entity';
import { User } from '../../auth/entities/user.entity';
import { Gender } from '../../teachers/entities/teacher.entity';
import { ParentStudent } from '../../parents/entities/parent-student.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ unique: true })
  admissionNumber!: string;

  @Column({ type: 'enum', enum: Gender })
  gender!: Gender;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Index()
  @ManyToOne(() => Class, (schoolClass) => schoolClass.students, {
    nullable: true,
  })
  @JoinColumn({ name: 'classId' })
  class?: Class;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  address!: string;

  @OneToOne((): typeof User => User, (user: User) => user.student)
  @JoinColumn()
  user!: User;

  @OneToMany(() => ParentStudent, (ps) => ps.student)
  parentStudents!: ParentStudent[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
