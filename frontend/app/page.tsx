'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from './api/tasks';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  dueAt: string;
  createdAt: string;
}

export default function TasksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', { page: 1, limit: 10 }],
    queryFn: () => getTasks(1, 10),
  });

  const tasks: Task[] = data?.items ?? [];

  const grouped = useMemo(() => {
    return tasks.reduce((acc: Record<TaskStatus, Task[]>, task: Task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p>Failed to load tasks</p>;

  return (
    <div>
      <h1>Tasks</h1>

      {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((status) => (
        <div key={status}>
          <h2>{status}</h2>

          {grouped[status]?.length ? (
            grouped[status].map((task: Task) => (
              <p key={task.id}>{task.title}</p>
            ))
          ) : (
            <p>No tasks</p>
          )}
        </div>
      ))}
    </div>
  );
}
