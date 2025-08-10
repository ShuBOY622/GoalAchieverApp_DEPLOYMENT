import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import goalsReducer from '../store/goalSlice'

// Explicitly rename conflicting exports to avoid ambiguity
export type { 
  User as AuthUser, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthState 
} from './auth';

export type { 
  User, 
  UserUpdate, 
  UserStats, 
  UserProfile, 
  Achievement, 
  ActivityItem, 
  LeaderboardUser, 
  PublicUser, 
  Friend, 
  UserResponse, 
  UsersListResponse 
} from './user';

export * from './goal';
export * from './notification';

// Common types
export interface ApiResponse<T = any> {
   T: any;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
}

export interface SelectOption {
  value: string | number;
  label: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
}
