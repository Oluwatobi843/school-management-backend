import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

describe('TeachersController', () => {
  let controller: TeachersController;
  let teachersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    assignSubjects: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    teachersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      assignSubjects: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [{ provide: TeachersService, useValue: teachersService }],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create', () => {
    const dto = { email: 't@e.com' } as never;

    controller.create(dto);

    expect(teachersService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', () => {
    const query = { page: '1' } as never;

    controller.findAll(query);

    expect(teachersService.findAll).toHaveBeenCalledWith(query);
  });

  it('should delegate findOne', () => {
    controller.findOne(3);

    expect(teachersService.findOne).toHaveBeenCalledWith(3);
  });

  it('should delegate assignSubjects', () => {
    controller.assignSubjects('5', { subjectIds: [1, 2] });

    expect(teachersService.assignSubjects).toHaveBeenCalledWith(5, [1, 2]);
  });

  it('should delegate remove', () => {
    controller.remove(3);

    expect(teachersService.remove).toHaveBeenCalledWith(3);
  });
});
