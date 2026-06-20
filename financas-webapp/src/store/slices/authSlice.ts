import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export interface User {
  id: string;
  name: string;
  username: string;
}

export interface AuthState {
  token: string | null;
  user: { user: User } | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('authToken'),
  user: localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser')!) : null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('authToken'),
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.post<{ token: string; id: string; username: string; name: string }>('/auth/login', credentials);
      const { token, id, username, name } = response;

      // Persist token and user to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify({ user: { id, username, name } }));

      // Set the token in the API service
      apiService.setToken(token);

      return { token, user: { id, username, name } };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao fazer login');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { username: string; name: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.post<{ token: string; id: string; username: string; name: string }>('/auth/register', data);
      const { token, id, username, name } = response;

      // Persist token and user to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify({ user: { id, username, name } }));

      // Set the token in the API service
      apiService.setToken(token);

      return { token, user: { id, username, name } };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao registrar');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      apiService.setToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = { user: action.payload.user };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = { user: action.payload.user };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
