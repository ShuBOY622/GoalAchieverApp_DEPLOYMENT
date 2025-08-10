import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, UserPlus, Target, ChevronDown } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Notification } from '../../types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationsListProps {
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  GOAL_COMPLETED: Target,
  GOAL_COMPLETED_BY_FRIEND: Target,
  GOAL_ASSIGNED: Target,
  CHALLENGE_RESPONSE: CheckCircle,
  CHALLENGE_RECEIVED: UserPlus,
  FRIEND_REQUEST: UserPlus,
  DEFAULT: CheckCircle,
};

const NOTIFICATIONS_PER_PAGE = 10;

export const NotificationsList: React.FC<NotificationsListProps> = ({ onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [userNames, setUserNames] = useState<Record<number, string>>({});

  const fetchNotifications = async (reset = false) => {
    try {
      if (!user?.id) return;
      
      const currentOffset = reset ? 0 : offset;
      setLoading(reset);
      setLoadingMore(!reset);
      
      const data = await notificationService.getUserNotifications(
        user.id,
        NOTIFICATIONS_PER_PAGE,
        currentOffset
      );
      
      if (reset) {
        setNotifications(data);
        setOffset(NOTIFICATIONS_PER_PAGE);
      } else {
        setNotifications(prev => [...prev, ...data]);
        setOffset(prev => prev + NOTIFICATIONS_PER_PAGE);
      }
      
      // Fetch usernames for new notifications
      data.forEach(notification => {
        if (notification.type === 'GOAL_COMPLETED_BY_FRIEND' && notification.sourceUserId) {
          fetchUserName(notification.sourceUserId);
        }
      });
      
      // If we got fewer notifications than requested, there are no more
      setHasMore(data.length === NOTIFICATIONS_PER_PAGE);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreNotifications = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(false);
    }
  };

  const markAllAsSeen = async () => {
    try {
      if (!user?.id) return;
      await notificationService.markAllAsSeen(user.id);
      // Update local state to mark all as seen
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, seen: true }))
      );
    } catch (err) {
      console.error('Failed to mark all as seen:', err);
    }
  };

  // Fetch user name for a notification
  const fetchUserName = async (userId: number): Promise<string> => {
    if (userNames[userId]) {
      console.log('Using cached username:', userNames[userId], 'for userId:', userId);
      return userNames[userId];
    }
    
    try {
      console.log('Fetching username for userId:', userId);
      const userData = await userService.getUserById(userId);
      console.log('Received userData:', userData);
      const name = userData.username;
      console.log('Setting username:', name, 'for userId:', userId);
      setUserNames(prev => ({ ...prev, [userId]: name }));
      return name;
    } catch (error) {
      console.error('Failed to fetch user name:', error);
      return 'A friend';
    }
  };

  // Format notification message with user name
  const formatNotificationMessage = async (notification: Notification): Promise<string> => {
    if (notification.type === 'GOAL_COMPLETED_BY_FRIEND' && notification.sourceUserId) {
      const userName = await fetchUserName(notification.sourceUserId);
      return `${userName} completed the goal: ${notification.message.split(': ')[1]}`;
    }
    return notification.message;
  };

  useEffect(() => {
    if (user?.id) {
      // Fetch initial notifications
      fetchNotifications(true);
      // Mark all notifications as seen when dropdown opens
      markAllAsSeen();
    }
  }, [user?.id]);

  // ✅ Listen for notification refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 NotificationsList: Refreshing due to event');
      if (user?.id) {
        fetchNotifications(true);
      }
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => window.removeEventListener('refreshNotifications', handleRefresh);
  }, [user?.id]);

  return (
    <div className="max-h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          <>
            {notifications.map((notification, index) => {
              const Icon = iconMap[notification.type] || iconMap.DEFAULT;
              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={async (id) => {
                    try {
                      await notificationService.markAsSeen(id);
                      setNotifications(prev =>
                        prev.map(n => n.id === id ? { ...n, seen: true } : n)
                      );
                    } catch (error) {
                      console.error('Failed to mark notification as seen:', error);
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      await notificationService.deleteNotification(id);
                      setNotifications(prev => prev.filter(n => n.id !== id));
                    } catch (error) {
                      console.error('Failed to delete notification:', error);
                    }
                  }}
                  userNames={userNames}
                />
              );
            })}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="p-4">
                <button
                  onClick={loadMoreNotifications}
                  disabled={loadingMore}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>Load more</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
