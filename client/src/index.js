import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider> {/* Wrap App inside AuthProvider */}
      <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
