'use client';

import { useEffect, useState } from 'react';
import { getTasks } from '../api/tasks';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getTasks();
        setTasks(data.items);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const todo = tasks.filter((t) => t.status === 'TODO');
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const done = tasks.filter((t) => t.status === 'DONE');

  return (
    <div>
      <h1>Tasks</h1>

      <h2>TODO</h2>
      {todo.map((t) => <div key={t.id}>{t.title}</div>)}

      <h2>IN_PROGRESS</h2>
      {inProgress.map((t) => <div key={t.id}>{t.title}</div>)}

      <h2>DONE</h2>
      {done.map((t) => <div key={t.id}>{t.title}</div>)}
    </div>
  );
}
