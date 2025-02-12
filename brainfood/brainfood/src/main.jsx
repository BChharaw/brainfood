// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PhoneContainer from './components/PhoneContainer';
import './index.css';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <PhoneContainer> */}
      <App />
    {/* </PhoneContainer> */}
  </React.StrictMode>
);