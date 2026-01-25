import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
  // Get the last task by order
  const lastTask = await this.tasksRepository.find({
    order: { order: 'DESC' },
    take: 1,
  });

  const maxOrder = lastTask[0]?.order ?? 0;

  const task = this.tasksRepository.create({
    ...createTaskDto,
    order: maxOrder + 1,
  });

  return this.tasksRepository.save(task);
}

   findAll() {
    return this.tasksRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number) {
    const task = await this.tasksRepository.findOneBy({ id });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
  const task = await this.tasksRepository.preload({
    id,
    ...updateTaskDto,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  return this.tasksRepository.save(task);
}

async remove(id: number) {
  const result = await this.tasksRepository.delete(id);

  if (result.affected === 0) {
    throw new NotFoundException('Task not found');
  }

  return;
}

async duplicate(id: number) {
  const task = await this.tasksRepository.findOneBy({ id });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  // find max order
  const lastTask = await this.tasksRepository.find({
    order: { order: 'DESC' },
    take: 1,
  });

  const maxOrder = lastTask[0]?.order ?? 0;

  const duplicateTask = this.tasksRepository.create({
    ...task,
    id: undefined,
    order: maxOrder + 1,
  });

  return this.tasksRepository.save(duplicateTask);
}



}
