import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@hv/ui/tokens.css';
import { AppProviders } from './app/AppProviders';
import { AdminApp } from './app/AdminApp';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <AppProviders>
      <AdminApp />
    </AppProviders>
  </StrictMode>,
);
