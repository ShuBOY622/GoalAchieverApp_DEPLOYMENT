import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Goal, CreateGoalData } from '../types/goal';
import { goalService } from '../services/goalService';

interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (userId: number) => {
    return await goalService.getGoals(userId);
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: CreateGoalData) => {
    return await goalService.createGoal(goalData);
  }
);

export const completeGoal = createAsyncThunk(
  'goals/completeGoal',
  async ({ goalId, userId }: { goalId: number; userId: number }) => {
    return await goalService.completeGoal(goalId, userId);
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setCurrentGoal: (state, action: PayloadAction<Goal | null>) => {
      state.currentGoal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch goals';
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(completeGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      });
  },
});

export const { setCurrentGoal, clearError } = goalSlice.actions;
export default goalSlice.reducer;
