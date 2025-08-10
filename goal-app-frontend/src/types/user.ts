export interface User {
  id: number;
  username: string;
  email: string;
  points: number;
  createdAt: string;
  passwordHash?: string; // Only for backend, not exposed in frontend
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
  lastLoginAt?: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserStats {
  totalGoals: number;
  completedGoals: number;
  missedGoals: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  joinedDate: string;
  averageCompletionTime?: number;
  successRate: number;
}

export interface UserProfile extends User {
  stats: UserStats;
  achievements: Achievement[];
  friends: User[];
  recentActivity: ActivityItem[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  points: number;
}

export interface ActivityItem {
  id: number;
  type: 'goal_completed' | 'friend_added' | 'goal_created' | 'achievement' | 'missed_goal';
  message: string;
  timestamp: string;
  points?: number;
  relatedId?: number;
}

export interface LeaderboardUser extends User {
  rank: number;
  completedGoals: number;
  streak: number;
}

// For search results and friend requests
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  points: number;
  avatarUrl?: string;
  createdAt: string;
}

// For friend system
export interface Friend extends PublicUser {
  friendshipDate: string;
  isOnline: boolean;
  mutualGoals: number;
}

// API Response types
export interface UserResponse {
  user: User;
  token?: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
