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
import { ParentStudent } from './parent-student.entity';

@Entity('parents')
@Index(['email'], { unique: true })
export class Parent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  firstName!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  lastName!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  email!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 30,
  })
  phoneNumber!: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  alternatePhoneNumber?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  occupation?: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @OneToMany(() => ParentStudent, (ps) => ps.parent)
  parentStudents!: ParentStudent[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
