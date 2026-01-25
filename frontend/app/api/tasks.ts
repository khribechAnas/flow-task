import { api } from '../lib/api';

export const getTasks = async (page: number = 1, limit: number = 100) => {
  const response = await api.get('/tasks', {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};
