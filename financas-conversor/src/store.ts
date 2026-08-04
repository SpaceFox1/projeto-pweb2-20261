import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Use the current API origin directly. The old .app domain redirects (301),
// which browsers reject before the redirected request can pass the CORS check.
const EXCHANGE_API_URL = 'https://api.frankfurter.dev/v1/latest';

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';

export const currencies: Array<{ code: CurrencyCode; name: string }> = [
  { code: 'BRL', name: 'Real brasileiro' },
  { code: 'USD', name: 'Dólar americano' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'JPY', name: 'Iene japonês' },
  { code: 'CAD', name: 'Dólar canadense' },
  { code: 'AUD', name: 'Dólar australiano' },
  { code: 'CHF', name: 'Franco suíço' },
];

interface ExchangeResponse {
  date: string;
  rates: Record<string, number>;
}

export interface Quote {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  quotedAt: string;
  fetchedAt: string;
}

interface ExchangeState {
  quotes: Record<string, Quote>;
  loading: boolean;
  error: string | null;
}

const quoteKey = (from: CurrencyCode, to: CurrencyCode) => `${from}-${to}`;

export const fetchExchangeRates = createAsyncThunk<Quote, { from: CurrencyCode; to: CurrencyCode }>(
  'exchange/fetchExchangeRates',
  async ({ from, to }) => {
    if (from === to) {
      return { from, to, rate: 1, quotedAt: new Date().toISOString().slice(0, 10), fetchedAt: new Date().toISOString() };
    }

    const response = await fetch(`${EXCHANGE_API_URL}?base=${from}&symbols=${to}`);
    if (!response.ok) throw new Error('Não foi possível consultar as cotações agora. Tente novamente.');

    const data = (await response.json()) as ExchangeResponse;
    const rate = data.rates[to];
    if (!rate) throw new Error('A cotação solicitada não está disponível.');

    return { from, to, rate, quotedAt: data.date, fetchedAt: new Date().toISOString() };
  },
);

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: { quotes: {}, loading: false, error: null } as ExchangeState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes[quoteKey(action.payload.from, action.payload.to)] = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Não foi possível consultar as cotações.';
      });
  },
});

export const selectQuote = (state: RootState, from: CurrencyCode, to: CurrencyCode) =>
  state.exchange.quotes[quoteKey(from, to)];

export const store = configureStore({ reducer: { exchange: exchangeSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
