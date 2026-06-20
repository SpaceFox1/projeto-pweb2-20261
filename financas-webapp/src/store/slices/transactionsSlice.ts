import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  date: string;
  description: string | null;
}

interface TransactionsPage {
  content: Transaction[];
  totalPages: number;
}

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const pageSize = 100;
      const firstPage = await apiService.get<TransactionsPage>(
        `/transactions?page=0&size=${pageSize}&sort=date,desc`,
      );

      if (firstPage.totalPages <= 1) {
        return firstPage.content;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) => (
          apiService.get<TransactionsPage>(
            `/transactions?page=${index + 1}&size=${pageSize}&sort=date,desc`,
          )
        )),
      );

      return [
        ...firstPage.content,
        ...remainingPages.flatMap((page) => page.content),
      ];
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Não foi possível carregar as transações.');
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await apiService.delete(`/transactions/${id}`);
      // Refetch transactions after successful deletion
      dispatch(fetchTransactions());
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Não foi possível deletar a transação.');
    }
  },
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async (
    data: {
      id: number;
      description: string;
      amount: number;
      type: TransactionType;
      categoryId: number;
      date: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.put<Transaction>(`/transactions/${data.id}`, {
        description: data.description,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        date: data.date,
      });
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Não foi possível atualizar a transação.');
    }
  },
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default transactionsSlice.reducer;
