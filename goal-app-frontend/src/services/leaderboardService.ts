import { api } from './api';
import { User } from '../types/auth';

export interface LeaderboardUser extends User {
  rank: number;
  completedGoals: number;
  streak: number;
}

export interface LeaderboardResponse {
  users: LeaderboardUser[];
  currentUserRank?: {
    rank: number;
    totalUsers: number;
    percentile: number;
  };
}

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (limit: number = 50, timeframe: 'weekly' | 'monthly' | 'allTime' = 'allTime'): Promise<LeaderboardResponse> => {
    console.log('🌐 Frontend: Fetching global leaderboard with limit:', limit, 'timeframe:', timeframe);
    try {
      const response = await api.get(`/users/leaderboard/global`, {
        params: { limit, timeframe }
      });
      console.log('✅ Frontend: Global leaderboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error fetching global leaderboard:', error);
      throw error;
    }
  },

  // Get friends leaderboard
  getFriendsLeaderboard: async (userId: number, limit: number = 10): Promise<LeaderboardUser[]> => {
    console.log('👥 Frontend: Fetching friends leaderboard for user:', userId, 'limit:', limit);
    try {
      const response = await api.get(`/users/leaderboard/friends/${userId}`, {
        params: { limit }
      });
      console.log('✅ Frontend: Friends leaderboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error fetching friends leaderboard:', error);
      throw error;
    }
  },

  // Get user's rank
  getUserRank: async (userId: number): Promise<{ rank: number; totalUsers: number; percentile: number }> => {
    console.log('📊 Frontend: Fetching user rank for user:', userId);
    try {
      const response = await api.get(`/users/leaderboard/user/${userId}/rank`);
      console.log('✅ Frontend: User rank response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error fetching user rank:', error);
      throw error;
    }
  },

  // Get top performers (for podium display)
  getTopPerformers: async (limit: number = 3, timeframe: 'weekly' | 'monthly' | 'allTime' = 'allTime'): Promise<LeaderboardUser[]> => {
    console.log('🏆 Frontend: Fetching top performers with limit:', limit, 'timeframe:', timeframe);
    try {
      const response = await api.get(`/users/leaderboard/top`, {
        params: { limit, timeframe }
      });
      console.log('✅ Frontend: Top performers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error fetching top performers:', error);
      throw error;
    }
  }
};