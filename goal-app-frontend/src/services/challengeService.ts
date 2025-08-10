import { api } from './api';

export interface Challenge {
  id: number;
  challengerId: number;
  challengedUserId: number;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  deadline: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  respondedAt?: string;
  sharedGoalId?: number;
  challengerName?: string;
  challengedUserName?: string;
}

export interface CreateChallengeData {
  challengerId: number;
  challengedUserId: number;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  deadline: string;
}

export const challengeService = {
  sendChallenge: async (data: CreateChallengeData): Promise<Challenge> => {
    const response = await api.post('/challenges/send', data);
    return response.data;
  },

  respondToChallenge: async (challengeId: number, userId: number, response: 'ACCEPT' | 'REJECT'): Promise<Challenge> => {
    const apiResponse = await api.put(`/challenges/${challengeId}/respond`, null, {
      params: { userId, response }
    });
    return apiResponse.data;
  },

  getPendingChallenges: async (userId: number): Promise<Challenge[]> => {
    console.log('Fetching pending challenges for user:', userId);
    const response = await api.get(`/challenges/pending/${userId}`);
    console.log('Pending challenges response:', response.data);
    return response.data;
  },

  getSentChallenges: async (userId: number): Promise<Challenge[]> => {
    console.log('Fetching sent challenges for user:', userId);
    const response = await api.get(`/challenges/sent/${userId}`);
    console.log('Sent challenges response:', response.data);
    return response.data;
  },
};
