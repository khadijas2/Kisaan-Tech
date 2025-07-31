import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Toaster position="top-right" />
        <App />
    </React.StrictMode>
)
