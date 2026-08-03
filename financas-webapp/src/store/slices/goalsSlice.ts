import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  startDate: string | null;
  deadline: string;
  categoryId: number | null;
  categoryName: string | null;
}

interface GoalsState {
  items: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  items: [],
  loading: false,
  error: null,
};

interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  deadline: string;
  categoryId?: number;
}

export const fetchGoals = createAsyncThunk(
  'goals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Goal[]>('/goals');
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Não foi possível carregar as metas.');
    }
  },
);

export const createGoal = createAsyncThunk(
  'goals/create',
  async (payload: CreateGoalPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Goal>('/goals', {
        name: payload.name,
        targetAmount: payload.targetAmount,
        deadline: payload.deadline,
        categoryId: payload.categoryId ?? null,
      });
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Não foi possível criar a meta.');
    }
  },
);

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, ...payload }: CreateGoalPayload & { id: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Goal>(`/goals/${id}`, {
        name: payload.name,
        targetAmount: payload.targetAmount,
        deadline: payload.deadline,
        categoryId: payload.categoryId ?? null,
      });
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Não foi possível atualizar a meta.');
    }
  },
);

export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/goals/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Não foi possível excluir a meta.');
    }
  },
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
        state.loading = false;
        state.items = state.items.map((goal) => (goal.id === action.payload.id ? action.payload : goal));
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter((goal) => goal.id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectGoalProgress = (goalId: number) => (state: { goals: GoalsState; transactions: { items: Array<{ amount: number; type: string }> } }) => {
  const goal = state.goals.items.find((item) => item.id === goalId);
  if (!goal) {
    return 0;
  }

  const incomeTransactions = state.transactions.items.filter((item) => item.type === 'INCOME');
  const spentTransactions = state.transactions.items.filter((item) => item.type === 'EXPENSE');
  const totalIncome = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = spentTransactions.reduce((sum, item) => sum + item.amount, 0);
  const netAmount = totalIncome - totalSpent;
  const percent = (netAmount / goal.targetAmount) * 100;

  if (Number.isNaN(percent)) {
    return 0;
  }

  return Math.min(100, Math.round(percent));
};

export default goalsSlice.reducer;
