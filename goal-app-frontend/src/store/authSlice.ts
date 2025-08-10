import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { User } from '../types/user'; // Import User type

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const user = await authService.login(credentials);
    localStorage.setItem('authToken', 'dummy-token');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials) => {
    const user = await authService.register(credentials);
    localStorage.setItem('authToken', 'dummy-token');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

// ✅ Add refresh user action
export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (userId: number) => {
    const user = await authService.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    loadUserFromStorage: (state) => {
      const userData = localStorage.getItem('user');
      if (userData) {
        state.user = JSON.parse(userData);
      }
    },
    // ✅ Add action to update user points immediately
    updateUserPoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.points = action.payload;
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    // ✅ Add action to update entire user object
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = 'dummy-token';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = 'dummy-token';
      })
      // ✅ Handle refresh user
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, loadUserFromStorage, updateUserPoints, updateUser } = authSlice.actions;
export default authSlice.reducer;
