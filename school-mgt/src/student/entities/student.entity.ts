import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";




@Entity('students')
export class Student{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    admissionNumber!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ unique: true})
    email!: string;

    @Column()
    gender!: string;

    @Column({ type: 'date'})
    dateOfBirth!: Date;

    @Column()
    className!: string;

    @Column({ nullable: true})
    phoneNumber!: string;

    @Column({ nullable: true})
    address!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}