import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task with auto-generated order', async () => {
      const createTaskDto = {
        title: 'Test Task',
        dueAt: '2026-01-30T00:00:00.000Z',
      };

      const savedTask = {
        id: 1,
        ...createTaskDto,
        order: 1,
        status: TaskStatus.TODO,
      };

      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);

      const result = await service.create(createTaskDto);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { order: 'DESC' },
        take: 1,
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        order: 1,
      });
      expect(result).toEqual(savedTask);
    });

    it('should create a task with provided order', async () => {
      const createTaskDto = {
        title: 'Test Task',
        dueAt: '2026-01-30T00:00:00.000Z',
        order: 5,
      };

      const savedTask = { id: 1, ...createTaskDto, status: TaskStatus.TODO };

      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);

      const result = await service.create(createTaskDto);

      expect(mockRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual(savedTask);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        status: TaskStatus.TODO,
        order: 1,
      };

      mockRepository.findOneBy.mockResolvedValue(task);

      const result = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Task not found');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = { id: 1, ...updateDto, order: 1 };

      mockRepository.preload.mockResolvedValue(updatedTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(1, updateDto);

      expect(mockRepository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateDto,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.preload.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a task with new order', async () => {
      const originalTask = {
        id: 1,
        title: 'Original Task',
        status: TaskStatus.TODO,
        order: 1,
      };

      const duplicatedTask = {
        ...originalTask,
        id: 2,
        order: 2,
      };

      mockRepository.findOneBy.mockResolvedValue(originalTask);
      mockRepository.find.mockResolvedValue([{ order: 1 }]);
      mockRepository.create.mockReturnValue(duplicatedTask);
      mockRepository.save.mockResolvedValue(duplicatedTask);

      const result = await service.duplicate(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result.order).toBe(2);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.duplicate(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const tasks = [
        { id: 1, title: 'Task 1', order: 1 },
        { id: 2, title: 'Task 2', order: 2 },
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, 2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        items: tasks,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ page: 1, limit: 10, status: TaskStatus.DONE });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.DONE },
      );
    });
  });

  describe('markAsInProgress', () => {
    it('should mark a TODO task as IN_PROGRESS', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        status: TaskStatus.TODO,
        order: 1,
      };

      const updatedTask = { ...task, status: TaskStatus.IN_PROGRESS };

      mockRepository.findOneBy.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.markAsInProgress(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...task,
        status: TaskStatus.IN_PROGRESS,
      });
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.markAsInProgress(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsDone', () => {
    it('should mark an IN_PROGRESS task as DONE', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        status: TaskStatus.IN_PROGRESS,
        order: 1,
      };

      const updatedTask = { ...task, status: TaskStatus.DONE };

      mockRepository.findOneBy.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.markAsDone(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('should mark a TODO task as DONE', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        status: TaskStatus.TODO,
        order: 1,
      };

      const updatedTask = { ...task, status: TaskStatus.DONE };

      mockRepository.findOneBy.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.markAsDone(1);

      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.markAsDone(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reopenTask', () => {
    it('should reopen a DONE task to TODO', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        status: TaskStatus.DONE,
        order: 1,
      };

      const updatedTask = { ...task, status: TaskStatus.TODO };

      mockRepository.findOneBy.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.reopenTask(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result.status).toBe(TaskStatus.TODO);
    });

    it('should reopen an IN_PROGRESS task to TODO', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        status: TaskStatus.IN_PROGRESS,
        order: 1,
      };

      const updatedTask = { ...task, status: TaskStatus.TODO };

      mockRepository.findOneBy.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.reopenTask(1);

      expect(result.status).toBe(TaskStatus.TODO);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.reopenTask(999)).rejects.toThrow(NotFoundException);
    });
  });
});