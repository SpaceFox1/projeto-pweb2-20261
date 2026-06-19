import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
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
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default transactionsSlice.reducer;
