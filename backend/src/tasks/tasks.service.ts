import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

//   async create(createTaskDto: CreateTaskDto): Promise<Task> {
//   // Get the last task by order
//   const lastTask = await this.tasksRepository.find({
//     order: { order: 'DESC' },
//     take: 1,
//   });

//   const maxOrder = lastTask[0]?.order ?? 0;

//   const task = this.tasksRepository.create({
//     ...createTaskDto,
//     order: maxOrder + 1,
//   });

//   return this.tasksRepository.save(task);
// }

  //  findAll() {
  //   return this.tasksRepository.find({
  //     order: { order: 'ASC' },
  //   });
  // }

async create(createTaskDto: CreateTaskDto): Promise<Task> {
  let order = createTaskDto.order;

  // If no order is provided, calculate the next order
  if (order === undefined) {
    const lastTask = await this.tasksRepository.find({
      order: { order: 'DESC' },
      take: 1,
    });

    order = (lastTask[0]?.order ?? 0) + 1;
  }

  const task = this.tasksRepository.create({
    ...createTaskDto,
    order,
  });

  return this.tasksRepository.save(task);
}



  async findAll(query: PaginationDto) {
  const { page = 1, limit = 10, status, order = 'ASC', search } = query;

  const qb = this.tasksRepository.createQueryBuilder('task');

  // Search
  if (search) {
    qb.andWhere('task.title ILIKE :search OR task.description ILIKE :search', {
      search: `%${search}%`,
    });
  }

  // Status filter
  if (status) {
    qb.andWhere('task.status = :status', { status });
  }

  // Order
  qb.orderBy('task.order', order);

  // Pagination
  qb.skip((page - 1) * limit);
  qb.take(limit);

  const [items, total] = await qb.getManyAndCount();

  return {
    items,
    total,
    page,
    limit,
  };
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
