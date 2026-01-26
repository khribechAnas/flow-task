import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    duplicate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        dueAt: '2026-01-30T00:00:00.000Z',
      };

      const expectedResult = {
        id: 1,
        ...createTaskDto,
        status: TaskStatus.TODO,
        order: 1,
      };

      mockTasksService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTaskDto);

      expect(service.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const expectedResult = {
        items: [{ id: 1, title: 'Task 1' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockTasksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const expectedResult = { id: 1, title: 'Task 1' };

      mockTasksService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { title: 'Updated Task' };
      const expectedResult = { id: 1, ...updateDto };

      mockTasksService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a task', async () => {
      const expectedResult = { id: 2, title: 'Task 1', order: 2 };

      mockTasksService.duplicate.mockResolvedValue(expectedResult);

      const result = await controller.duplicate('1');

      expect(service.duplicate).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});