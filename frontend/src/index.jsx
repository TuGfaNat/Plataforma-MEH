import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'; // Importa la configuración de i18n

// Silenciador de advertencias conocidas de librerías externas
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('findDOMNode is deprecated') || 
    args[0].includes('A rule was not resolved to CSS properly')
  )) return;
  originalWarn(...args);
};

console.error = (...args) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('findDOMNode is deprecated') || 
    args[0].includes('A rule was not resolved to CSS properly')
  )) return;
  originalError(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
