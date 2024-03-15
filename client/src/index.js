import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the client method for React 18
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // React 18 root API

root.render(
  <React.StrictMode>
    <App /> {/* AuthProvider is now inside App, so we don't wrap it here */}
  </React.StrictMode>
);
