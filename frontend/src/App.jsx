import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from './NotificationsContext';
import { AuthProvider } from './AuthContext';
import AppContent from './AppContent';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <ToastContainer />
          <AppContent />
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;