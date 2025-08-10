import { api } from './api';
import { Goal, CreateGoalData } from '../types/goal';

export const goalService = {
  getGoals: async (userId: number): Promise<Goal[]> => {
    const response = await api.get(`/goals/user/${userId}`);
    return response.data;
  },

  createGoal: async (goalData: CreateGoalData): Promise<Goal> => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  completeGoal: async (goalId: number, userId: number): Promise<Goal> => {
    const response = await api.put(`/goals/${goalId}/complete?userId=${userId}`);
    return response.data;
  },

  getGoalById: async (goalId: number): Promise<Goal> => {
    const response = await api.get(`/goals/${goalId}`);
    return response.data;
  },
};
