import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { invalidateSpendingLimitsCache } from '../../utils/serviceWorkerCache';

export interface SpendingLimit {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: number;
}

interface SpendingLimitsState {
  items: SpendingLimit[];
  loading: boolean;
  error: string | null;
}

const initialState: SpendingLimitsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchSpendingLimits = createAsyncThunk(
  'spendingLimits/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<SpendingLimit[]>('/spending-limits');
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Não foi possível carregar os limites de gastos.');
    }
  },
);

export const createSpendingLimit = createAsyncThunk(
  'spendingLimits/create',
  async (payload: { categoryId: number; limitAmount: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.post<SpendingLimit>('/spending-limits', payload);
      invalidateSpendingLimitsCache();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Não foi possível criar o limite de gastos.');
    }
  },
);

export const deleteSpendingLimit = createAsyncThunk(
  'spendingLimits/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/spending-limits/${id}`);
      invalidateSpendingLimitsCache();
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Não foi possível excluir o limite de gastos.');
    }
  },
);

const spendingLimitsSlice = createSlice({
  name: 'spendingLimits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpendingLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpendingLimits.fulfilled, (state, action: PayloadAction<SpendingLimit[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSpendingLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSpendingLimit.fulfilled, (state, action: PayloadAction<SpendingLimit>) => {
        state.items = [action.payload, ...state.items.filter((item) => item.categoryId !== action.payload.categoryId)];
      })
      .addCase(createSpendingLimit.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteSpendingLimit.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteSpendingLimit.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export function calculateSpendingPercent(spent: number, limitAmount: number): number {
  if (limitAmount <= 0) {
    return 0;
  }

  return Math.round((spent / limitAmount) * 100);
}

export function getSpendingBarWidth(percentUsed: number): number {
  return Math.min(100, percentUsed);
}

export function getSpendingStatusColor(percentUsed: number): string {
  if (percentUsed >= 100) {
    return '#dc2626';
  }

  if (percentUsed >= 80) {
    return '#f59e0b';
  }

  return '#16a34a';
}

export interface SpendingStatusItem {
  categoryId: number;
  limitAmount: number;
  spent: number;
  percentUsed: number;
  categoryName: string;
}

export function getProjectedSpendingStatus(
  status: SpendingStatusItem | undefined,
  additionalExpense: number,
): (SpendingStatusItem & { projectedSpent: number; projectedPercent: number }) | null {
  if (!status) {
    return null;
  }

  const projectedSpent = status.spent + additionalExpense;
  const projectedPercent = calculateSpendingPercent(projectedSpent, status.limitAmount);

  return {
    ...status,
    projectedSpent,
    projectedPercent,
  };
}

export const selectSpendingStatus = (state: {
  spendingLimits: SpendingLimitsState;
  transactions: { items: Array<{ amount: number; type: string; categoryId: number; date: string }> };
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return state.spendingLimits.items.map((limit) => {
    const spent = state.transactions.items
      .filter((transaction) => {
        if (transaction.type !== 'EXPENSE') return false;
        if (transaction.categoryId !== limit.categoryId) return false;

        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const percentUsed = calculateSpendingPercent(spent, limit.limitAmount);

    return {
      categoryId: limit.categoryId,
      limitAmount: limit.limitAmount,
      spent,
      percentUsed,
      categoryName: limit.categoryName,
    };
  });
};

export default spendingLimitsSlice.reducer;
