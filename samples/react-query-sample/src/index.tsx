import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './api/apiLayer'; // Creates the ApiLayer for later use
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
