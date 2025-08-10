export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  GOALS: '/goals',
  FRIENDS: '/friends',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
} as const;

export const GOAL_DIFFICULTIES = {
  EASY: { points: 10, color: 'green' },
  MEDIUM: { points: 20, color: 'yellow' },
  HARD: { points: 30, color: 'red' },
} as const;

export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_REQUEST_RESPONSE: 'FRIEND_REQUEST_RESPONSE',
  GOAL_COMPLETED: 'GOAL_COMPLETED',
  GOAL_COMPLETED_BY_FRIEND: 'GOAL_COMPLETED_BY_FRIEND',
  GOAL_ASSIGNED: 'GOAL_ASSIGNED',
  GOAL_MISSED: 'GOAL_MISSED',
} as const;
