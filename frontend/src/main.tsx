import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { ThemeProvider } from './theme/ThemeProvider';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
