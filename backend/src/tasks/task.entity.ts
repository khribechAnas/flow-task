import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { TaskStatus } from './task-status.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column()
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  dueAt: Date;
}
