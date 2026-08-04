import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthLayout, DashboardLayout } from './layouts/index.ts';
import { LoginPage, RegisterPage, HomePage, TransactionsPage, AddTransactionPage, GoalsPage, SpendingLimitsPage, ExportPage, ExchangePage } from './routes/index.ts';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { NetworkErrorModal } from './components/NetworkErrorModal.tsx';
import { requestNotificationPermission } from './utils/serviceWorkerCache';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update();
      })
      .catch((error) => {
        console.error('Falha ao registrar Service Worker:', error);
      });
  });
}

void requestNotificationPermission();

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

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/new" element={<AddTransactionPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/spending-limits" element={<SpendingLimitsPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/exchange" element={<ExchangePage />} />
          </Route>

          {/* match any other route - 404*/}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NetworkErrorModal />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
