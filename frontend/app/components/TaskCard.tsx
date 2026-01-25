'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../page';

interface TaskCardProps {
  task: Task;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  isDuplicating?: boolean;
  isDeleting?: boolean;
}

export function TaskCard({
  task,
  onDuplicate,
  onDelete,
  onEdit,
  isDuplicating,
  isDeleting,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-gray-100 rounded p-3 hover:bg-gray-200 transition-colors duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <p className="font-semibold text-gray-900">{task.title}</p>
      {task.description && (
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Due: {new Date(task.dueAt).toLocaleDateString()}
      </p>

      {/* Buttons shown only on hover */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
        >
          ✏️ Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(task.id);
          }}
          disabled={isDuplicating}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xs px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
        >
          📋 Duplicate
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          disabled={isDeleting}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-xs px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
