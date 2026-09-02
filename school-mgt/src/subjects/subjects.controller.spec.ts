import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let subjectsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    subjectsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [{ provide: SubjectsService, useValue: subjectsService }],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create', () => {
    const dto = { code: 'MATH', name: 'Mathematics' } as never;

    controller.create(dto);

    expect(subjectsService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', () => {
    const query = {} as never;

    controller.findAll(query);

    expect(subjectsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should delegate findOne', () => {
    controller.findOne(6);

    expect(subjectsService.findOne).toHaveBeenCalledWith(6);
  });

  it('should delegate update', () => {
    const dto = { name: 'Maths' } as never;

    controller.update(6, dto);

    expect(subjectsService.update).toHaveBeenCalledWith(6, dto);
  });

  it('should delegate remove', () => {
    controller.remove(6);

    expect(subjectsService.remove).toHaveBeenCalledWith(6);
  });
});
