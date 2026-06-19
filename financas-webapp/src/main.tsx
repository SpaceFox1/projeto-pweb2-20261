import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout, MainLayout } from './layouts/index.ts';
import { LoginPage, RegisterPage, HomePage, TransactionsPage } from './routes/index.ts';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
