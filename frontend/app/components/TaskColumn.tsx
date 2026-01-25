'use client';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Task } from '../page';

interface TaskColumnProps {
  status: string;
  tasks: Task[];
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  isDuplicatingId?: number;
  isDeletingId?: number;
}

export function TaskColumn({
  status,
  tasks,
  onDuplicate,
  onDelete,
  isDuplicatingId,
  isDeletingId,
}: TaskColumnProps) {
  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b">{status}</h2>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {tasks.length ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                isDuplicating={isDuplicatingId === task.id}
                isDeleting={isDeletingId === task.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No tasks</p>
        )}
      </SortableContext>
    </div>
  );
}
