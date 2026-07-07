import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Class } from '../../classes/entities/class.entity';

import { User } from 'src/auth/entities/user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  admissionNumber!: string;

  @Column()
  gender!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

@ManyToOne(() => Class, (schoolClass) => schoolClass.students, {
  eager: true,
  nullable: true,
})
@JoinColumn({ name: 'classId' })
class?: Class;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  address!: string;

  //  RELATION ONLY (NO manual userId column)
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}