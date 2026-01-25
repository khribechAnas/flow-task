import { Body, Controller, Delete, Query, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  // @Get()
  // findAll() {
  //   return this.tasksService.findAll();
  // }

   @Get()
  findAll(@Query() query: PaginationDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

   @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

   @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.tasksService.duplicate(+id);
  }

}
