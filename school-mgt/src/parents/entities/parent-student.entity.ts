import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { Parent } from './parent.entity';
import { Student } from '../../student/entities/student.entity';

export enum ParentRelationship {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
  GRANDPARENT = 'GRANDPARENT',
  OTHER = 'OTHER',
}

@Entity('parent_students')
@Unique(['parent', 'student'])
export class ParentStudent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne(() => Parent, (parent) => parent.parentStudents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent!: Parent;

  @Index()
  @ManyToOne(() => Student, (student) => student.parentStudents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Column({
    type: 'enum',
    enum: ParentRelationship,
  })
  relationship!: ParentRelationship;

  @Column({
    type: 'boolean',
    default: false,
  })
  isPrimaryContact!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isEmergencyContact!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
