'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { getTasks, createTask, updateTask, deleteTask, duplicateTask, updateTaskOrder, CreateTaskInput } from './api/tasks';
import { TaskColumn } from './components/TaskColumn';
import { ColumnPagination } from './components/ColumnPagination';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  dueAt: string;
  createdAt: string;
}

type TasksResponse = {
  items: Task[];
  total: number;
  page: number;
  limit: number;
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskInput>({
    title: '',
    description: '',
    dueAt: new Date().toISOString().split('T')[0],
    status: 'TODO',
  });

  const [pageTodo, setPageTodo] = useState(1);
  const [pageInProgress, setPageInProgress] = useState(1);
  const [pageDone, setPageDone] = useState(1);

  const {
    data: todoData,
    isLoading: isLoadingTodo,
    isError: isErrorTodo,
  } = useQuery<TasksResponse>({
    queryKey: ['tasks', 'TODO', pageTodo],
    queryFn: () => getTasks(pageTodo, 10, 'TODO'),
  });

  const {
    data: inProgressData,
    isLoading: isLoadingInProgress,
    isError: isErrorInProgress,
  } = useQuery<TasksResponse>({
    queryKey: ['tasks', 'IN_PROGRESS', pageInProgress],
    queryFn: () => getTasks(pageInProgress, 10, 'IN_PROGRESS'),
  });

  const {
    data: doneData,
    isLoading: isLoadingDone,
    isError: isErrorDone,
  } = useQuery<TasksResponse>({
    queryKey: ['tasks', 'DONE', pageDone],
    queryFn: () => getTasks(pageDone, 10, 'DONE'),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFeedback({ type: 'success', message: 'Task created!' });
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', dueAt: new Date().toISOString().split('T')[0], status: 'TODO' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to create task' });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFeedback({ type: 'success', message: 'Task deleted!' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to delete task' });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, order, status }: { id: number; order: number; status?: string }) =>
      updateTaskOrder(id, order, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to update task order' });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFeedback({ type: 'success', message: 'Task duplicated!' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to duplicate task' });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const tasks: Task[] = [
    ...(todoData?.items ?? []),
    ...(inProgressData?.items ?? []),
    ...(doneData?.items ?? []),
  ];

  const grouped = useMemo(() => {
    return {
      TODO: todoData?.items ?? [],
      IN_PROGRESS: inProgressData?.items ?? [],
      DONE: doneData?.items ?? [],
    } as Record<TaskStatus, Task[]>;
  }, [todoData, inProgressData, doneData]);

  const columns = [
    {
      status: 'TODO' as TaskStatus,
      tasks: grouped.TODO,
      page: pageTodo,
      total: todoData?.total ?? 0,
      setPage: setPageTodo,
    },
    {
      status: 'IN_PROGRESS' as TaskStatus,
      tasks: grouped.IN_PROGRESS,
      page: pageInProgress,
      total: inProgressData?.total ?? 0,
      setPage: setPageInProgress,
    },
    {
      status: 'DONE' as TaskStatus,
      tasks: grouped.DONE,
      page: pageDone,
      total: doneData?.total ?? 0,
      setPage: setPageDone,
    },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    if (!overTask) return;

    // Calculate new order based on position in list
    const statusTasks = grouped[activeTask.status] || [];
    const currentIndex = statusTasks.findIndex((t) => t.id === active.id);
    const overIndex = statusTasks.findIndex((t) => t.id === over.id);

    let newOrder: number;
    if (overIndex > currentIndex) {
      newOrder = overTask.order + 1;
    } else {
      newOrder = Math.max(0, overTask.order - 1);
    }

    updateOrderMutation.mutate({
      id: activeTask.id,
      order: newOrder,
    });
  };

  if (isLoadingTodo || isLoadingInProgress || isLoadingDone) return <p className="text-center mt-8">Loading tasks...</p>;
  if (isErrorTodo || isErrorInProgress || isErrorDone) return <p className="text-center mt-8 text-red-500">Failed to load tasks</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Tasks</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            + Create Task
          </button>
        </div>

        {feedback && (
          <div
            className={`fixed bottom-4 right-4 z-50 w-64 p-4 rounded-lg shadow-lg ${
              feedback.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create Task</h2>
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              />
              <input
                type="date"
                value={newTask.dueAt}
                onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              />
              <select
                value={newTask.status || 'TODO'}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => createMutation.mutate(newTask)}
                  disabled={!newTask.title || createMutation.isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <div key={col.status} className="flex flex-col gap-3">
                <TaskColumn
                  status={col.status}
                  tasks={col.tasks}
                  onDuplicate={(id) => duplicateMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDuplicatingId={undefined}
                  isDeletingId={undefined}
                />
                <ColumnPagination
                  page={col.page}
                  total={col.total}
                  onPrev={() => col.setPage((p: number) => Math.max(1, p - 1))}
                  onNext={() => {
                    const maxPage = Math.max(1, Math.ceil(col.total / 10));
                    col.setPage((p: number) => Math.min(maxPage, p + 1));
                  }}
                />
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
