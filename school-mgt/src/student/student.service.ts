import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  // Create student
  async create(dto: CreateStudentDto) {
    const student = this.studentRepository.create(dto);
    const saved = await this.studentRepository.save(student);

    return {
      message: 'Student created successfully',
      data: saved,
    };
  }

//   GET ALL STUDENTS
 async findAll(){
    const students = await this.studentRepository.find();
    return {
        message: 'Students fetched successfully',
        data: students,
    }
 }

// GET STUDENT BY ADMISSION 
 async findByAdmissionNumber(admissionNumber: string) {
  return this.studentRepository.findOne({
    where: { admissionNumber },
  });
}

//  GET STUDENT BY ID
async findOne(id: number){
    const student = await this.studentRepository.findOneBy( {id});

    if(!student){
        throw new Error(`Student with ID ${id} not found`)
    }

    return {
        message: 'Student retrieved successfully',
        data: student,
    };
}

// UPDATE STUDENT
async update(id: number, dto: UpdateStudentDto){
    const student = await this.studentRepository.findOneBy({ id})

    if(!student){
        throw new Error(`Student with ID ${id} not found`)
    }

    const updatedStudent = await this.studentRepository.save({ ...student, ...dto});
    
    return {
        message: 'Student updated successfully',
        data: updatedStudent
    }
}

// DELETE STUDENT
async remove(id: number){
    const student =  await this.studentRepository.findOneBy({id});

    if(!student){
        throw new Error(`Student with ID ${id} not found`)
    }
     
    await this.studentRepository.delete(id);
    return {
        message: 'Student deleted successfully',
    };
}
}