import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

describe('StudentController', () => {
  let controller: StudentController;
  let studentService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findByAdmissionNumber: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    studentService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByAdmissionNumber: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [{ provide: StudentService, useValue: studentService }],
    }).compile();

    controller = module.get<StudentController>(StudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create with discarding sub id', () => {
    const dto = { email: 's@e.com' } as never;
    const user = { sub: 1 } as never;

    controller.create(dto, user);

    expect(studentService.create).toHaveBeenCalledWith(dto, 1);
  });

  it('should delegate findAll with parsed page and limit', () => {
    controller.findAll('2', '5');

    expect(studentService.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('should delegate findOne', () => {
    const user = {} as never;

    controller.findOne(7, user);

    expect(studentService.findOne).toHaveBeenCalledWith(7, user);
  });

  it('should delegate remove', () => {
    controller.remove(7);

    expect(studentService.remove).toHaveBeenCalledWith(7);
  });
});
