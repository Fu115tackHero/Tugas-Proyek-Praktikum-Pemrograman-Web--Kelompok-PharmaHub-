// file: src/main.jsx atau src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// IMPORT INI LEK!
import { UserProvider } from './context/UserContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BUNGKUS APP DENGAN USERPROVIDER */}
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
);