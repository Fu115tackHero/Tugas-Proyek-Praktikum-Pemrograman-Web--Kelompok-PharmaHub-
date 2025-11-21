// file: src/main.jsx atau src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// IMPORT INI LEK!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BUNGKUS APP DENGAN USERPROVIDER */}
    <App />
  </React.StrictMode>,
);