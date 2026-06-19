import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";





@Entity('teachers')
export class Teacher {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    employeeId!: string;

     @Column()
    firstName!: string;

    @Column()
    lastName!: string;

     @Column({ unique: true })
     email!: string;

     @Column()
     phoneNumber!: string;

    @Column()
    gender!: string;

    @Column({ nullable: true })
    qualification!: string;

    @Column({ nullable: true })
    specialization!: string;

    @Column({ type: 'date' })
    hireDate!: Date;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}