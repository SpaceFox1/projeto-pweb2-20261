import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout } from './layouts/index.ts';
import { LoginPage } from './routes/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
            </Route>
          </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
