import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import ConfigErrorScreen from './components/ConfigErrorScreen';
import { supabaseConfigError } from './lib/supabase';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {supabaseConfigError ? <ConfigErrorScreen message={supabaseConfigError} /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
