import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../task-status.enum';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsString()
  search?: string;
}
