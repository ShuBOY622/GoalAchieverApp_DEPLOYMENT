import { api } from './api';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/users/login', credentials);
  const user = response.data;

  localStorage.setItem('user', JSON.stringify(user));
  return user;
},


  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await api.post('/users/register', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) throw new Error('User not logged in');

  const user = JSON.parse(storedUser);
  const response = await api.get(`/users/me?id=${user.id}`);
  return response.data;
},


  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  },
};
