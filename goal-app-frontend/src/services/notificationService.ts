import { api } from './api';
import { Notification } from '../types/notification';

export const notificationService = {


  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await api.put(`/notifications/user/${userId}/read-all`);
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await api.get(`/notifications/user/${userId}/unread-count`);
    return response.data.count;
  },


  getUserNotifications: async (userId: number, limit?: number, offset?: number): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    console.log('🔍 Fetching notifications for user:', userId, 'with params:', params.toString());
    const response = await api.get(`/notifications/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`);
    console.log('📬 Received notifications:', response.data);
    return response.data;
  },

  getUnseenNotifications: async (userId: number): Promise<Notification[]> => {
    console.log('🔍 Fetching unseen notifications for user:', userId);
    const response = await api.get(`/notifications/user/${userId}/unseen`);
    console.log('📬 Received unseen notifications:', response.data);
    return response.data;
  },

  getUnseenCount: async (userId: number): Promise<number> => {
    console.log('🔍 Fetching unseen count for user:', userId);
    const response = await api.get(`/notifications/user/${userId}/unseen-count`);
    console.log('📊 Received unseen count:', response.data);
    return response.data;
  },

  markAsSeen: async (notificationId: number): Promise<Notification> => {
    const response = await api.put(`/notifications/${notificationId}/mark-seen`);
    return response.data;
  },

  markAllAsSeen: async (userId: number): Promise<void> => {
    await api.put(`/notifications/user/${userId}/mark-all-seen`);
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
