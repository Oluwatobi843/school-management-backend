import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';

export enum ClassLevel {
  NURSERY = 'Nursery',
  PRIMARY = 'Primary',
  JSS = 'JSS',
  SS = 'SS',
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    type: 'enum',
    enum: ClassLevel,
  })
  level!: ClassLevel;

  @Column({
    length: 10,
  })
  section!: string;

  @Column({
    type: 'int',
    default: 40,
  })
  capacity!: number;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @OneToMany(
    () => Student,
    (student) => student.class,
  )
  students!: Student[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}