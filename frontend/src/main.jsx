import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

const accessToken = localStorage.getItem('accessToken');

if (accessToken) {
  store.dispatch(fetchCurrentUser()).catch(() => {
    // Token invalid/expired — auth state is already cleared by the rejected handler
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
