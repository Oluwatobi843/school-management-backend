import { Test, TestingModule } from '@nestjs/testing';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

describe('ParentsController', () => {
  let controller: ParentsController;
  let parentsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    linkStudent: jest.Mock;
    getStudents: jest.Mock;
    getStudentRelationship: jest.Mock;
    updateStudentRelationship: jest.Mock;
    unlinkStudent: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    parentsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      linkStudent: jest.fn(),
      getStudents: jest.fn(),
      getStudentRelationship: jest.fn(),
      updateStudentRelationship: jest.fn(),
      unlinkStudent: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentsController],
      providers: [{ provide: ParentsService, useValue: parentsService }],
    }).compile();

    controller = module.get<ParentsController>(ParentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create', () => {
    const dto = { email: 'p@e.com' } as never;

    controller.create(dto);

    expect(parentsService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', () => {
    const query = {} as never;

    controller.findAll(query);

    expect(parentsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should delegate findOne', () => {
    controller.findOne(3);

    expect(parentsService.findOne).toHaveBeenCalledWith(3);
  });

  it('should delegate linkStudent', () => {
    const dto = { studentId: 5 } as never;

    controller.linkStudent(3, dto);

    expect(parentsService.linkStudent).toHaveBeenCalledWith(3, dto);
  });

  it('should delegate getStudents', () => {
    controller.getStudents(3);

    expect(parentsService.getStudents).toHaveBeenCalledWith(3);
  });

  it('should delegate updateStudentRelationship', () => {
    const dto = {} as never;

    controller.updateStudentRelationship(3, 5, dto);

    expect(parentsService.updateStudentRelationship).toHaveBeenCalledWith(
      3,
      5,
      dto,
    );
  });

  it('should delegate unlinkStudent', () => {
    controller.unlinkStudent(3, 5);

    expect(parentsService.unlinkStudent).toHaveBeenCalledWith(3, 5);
  });

  it('should delegate remove', () => {
    controller.remove(3);

    expect(parentsService.remove).toHaveBeenCalledWith(3);
  });
});
