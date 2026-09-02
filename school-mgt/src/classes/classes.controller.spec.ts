import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

describe('ClassesController', () => {
  let controller: ClassesController;
  let classesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    classesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [{ provide: ClassesService, useValue: classesService }],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create', () => {
    const dto = { name: 'Grade 5' } as never;

    controller.create(dto);

    expect(classesService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', () => {
    const query = {} as never;

    controller.findAll(query);

    expect(classesService.findAll).toHaveBeenCalledWith(query);
  });

  it('should delegate findOne', () => {
    controller.findOne(4);

    expect(classesService.findOne).toHaveBeenCalledWith(4);
  });

  it('should delegate update', () => {
    const dto = { name: 'Grade 6' } as never;

    controller.update(4, dto);

    expect(classesService.update).toHaveBeenCalledWith(4, dto);
  });

  it('should delegate remove', () => {
    controller.remove(4);

    expect(classesService.remove).toHaveBeenCalledWith(4);
  });
});
