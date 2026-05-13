import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import Honeybadger from '@honeybadger-io/js';
import { HoneybadgerErrorBoundary } from '@honeybadger-io/react';
import App from './App.tsx';
import './index.css';

Honeybadger.configure({
  apiKey: import.meta.env.VITE_HONEYBADGER_API_KEY || '',
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HoneybadgerErrorBoundary honeybadger={Honeybadger}>
      <App />
    </HoneybadgerErrorBoundary>
  </StrictMode>,
);
