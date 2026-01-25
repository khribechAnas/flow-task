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
    const task = this.tasksRepository.create({
      ...createTaskDto,
      order: 0, // placeholder, will update later
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

}
