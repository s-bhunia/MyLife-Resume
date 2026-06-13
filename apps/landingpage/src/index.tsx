import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
