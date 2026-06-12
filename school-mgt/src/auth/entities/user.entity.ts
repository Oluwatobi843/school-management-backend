import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CreateDateColumn } from "typeorm/browser";


export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}



@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ unique: true})
  email!: string

  @Column()
  password!: string


  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })

  @Column({ default: true})
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;

}