import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { fetchCurrentUser, setCredentials } from './redux/slices/authSlice';
import App from './App';
import './index.css';

const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

if (accessToken) {
  store.dispatch(fetchCurrentUser());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
