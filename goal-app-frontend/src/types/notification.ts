export interface Notification {
  id: number;
  userId: number;
  type: 'CHALLENGE_RESPONSE' | 'CHALLENGE_ACCEPTED' | 'GOAL_ASSIGNED' | 'GOAL_COMPLETED_BY_FRIEND' | 'CHALLENGE_RECEIVED' | 'FRIEND_REQUEST' | 'GOAL_COMPLETED' | string;
  message: string;
  seen: boolean;
  createdAt: string;
  relatedId?: number; // For challenge ID, goal ID, etc.
  timestamp?: number[] | string; // Support both Kafka timestamp format and ISO string
  sourceUserId?: number; // User who triggered the notification
}
