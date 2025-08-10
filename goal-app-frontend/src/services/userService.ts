import { api } from './api';
import { User } from '../types/auth';

export interface UserUpdate {
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

export interface UserStats {
  totalGoals: number;
  completedGoals: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  joinedDate: string;
}

export const userService = {
  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Search users by query
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users/search`, { 
      params: { query } 
    });
    return response.data;
  },

  // Get user statistics
  getUserStats: async (id: number): Promise<UserStats> => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  },

  // Update user points
  updateUserPoints: async (id: number, pointsChange: number): Promise<User> => {
    const response = await api.put(`/users/${id}/points`, null, {
      params: { pointsChange }
    });
    return response.data;
  },

  // Get user leaderboard position
  getUserRank: async (id: number): Promise<{ rank: number; totalUsers: number }> => {
    const response = await api.get(`/users/${id}/rank`);
    return response.data;
  },

  // Upload user avatar
  uploadAvatar: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.avatarUrl;
  },

  // Delete user account
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
