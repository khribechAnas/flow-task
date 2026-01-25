import { IsString, IsOptional, IsEnum, IsDateString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  dueAt: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
