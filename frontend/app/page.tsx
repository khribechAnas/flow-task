'use client';

import { useEffect, useState } from 'react';
import { getTasks } from './api/tasks';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  order: number;
  dueAt: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getTasks(1, 10); // 👈 fetch only 10 tasks
        const sorted = data.items.sort((a: Task, b: Task) => a.order - b.order);
        setTasks(sorted);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div>
      <h1>Tasks</h1>

      {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => (
        <div key={status}>
          <h2>{status}</h2>

          {grouped[status]?.length ? (
            grouped[status].map((task) => (
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
