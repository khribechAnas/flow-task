import { api } from '../lib/api';

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueAt: string;
  status?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  dueAt?: string;
}

export const getTasks = async (page: number = 1, limit: number = 100) => {
  const response = await api.get('/tasks', {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

export const createTask = async (data: CreateTaskInput) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTask = async (id: number, data: UpdateTaskInput) => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};

export const duplicateTask = async (id: number) => {
  const response = await api.post(`/tasks/${id}/duplicate`);
  return response.data;
};

export const updateTaskOrder = async (id: number, order: number, status?: string) => {
  const data: any = { order };
  if (status) data.status = status;
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};
