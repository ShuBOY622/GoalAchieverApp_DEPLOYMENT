import { api } from './api';

export interface FriendRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  fromUsername?: string;
  toUsername?: string;
  status: string;
  createdAt: string;
  respondedAt?: string;
}

export const friendService = {
  sendFriendRequest: async (fromUserId: number, toUserId: number): Promise<FriendRequest> => {
    const response = await api.post(`/friend-requests/send?fromUserId=${fromUserId}&toUserId=${toUserId}`);
    return response.data;
  },

  respondToFriendRequest: async (requestId: number, userId: number, status: 'ACCEPTED' | 'REJECTED'): Promise<FriendRequest> => {
    const response = await api.put(`/friend-requests/${requestId}/respond?userId=${userId}&status=${status}`);
    return response.data;
  },

  getPendingRequests: async (userId: number): Promise<FriendRequest[]> => {
    const response = await api.get(`/friend-requests/pending/${userId}`);
    return response.data;
  },

  getFriends: async (userId: number): Promise<any[]> => {
    const response = await api.get(`/friend-requests/friends/${userId}`);
    return response.data;
  },
};
