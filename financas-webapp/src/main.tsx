import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout } from './layouts/index.ts';
import { DashboardPage, LoginPage } from './routes/index.ts';
import { ProtectedRoute } from './components/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
