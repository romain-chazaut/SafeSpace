import React, { useContext, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { MdDashboard, MdHistory, MdStorage, MdBackup, MdRestore, MdLink, MdAddLink, MdSchedule } from 'react-icons/md';
import { AuthContext } from './AuthContext';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import DatabaseManager from './pages/DatabaseManager';
import Backup from './pages/Backup';
import Restore from './pages/Restore';
import Connections from './pages/Connection';
import NewConnection from './pages/NewConnection';
import CronManager from './pages/CronManager';
import NotificationManager from './pages/NotificationsManager';
import LogoutConfirmation from '../src/LogoutConfirmation';

const AppContent = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirmation(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <ul>
          <li><Link to="/"><MdDashboard style={{ color: '#1E88E5' }} /> Dashboard</Link></li>
          <li><Link to="/history"><MdHistory style={{ color: '#FF9800' }} /> Historique</Link></li>
          <li><Link to="/database"><MdStorage style={{ color: '#673AB7' }} /> DataManager</Link></li>
          <li><Link to="/backup"><MdBackup style={{ color: '#4CAF50' }} /> Backup</Link></li>
          <li><Link to="/restore"><MdRestore style={{ color: '#F44336' }} /> Restore</Link></li>
          <li><Link to="/connections"><MdLink style={{ color: '#FFC107' }} /> Connexions</Link></li>
          <li>
            {isLoggedIn ? (
              <Link to="#" onClick={handleLogoutClick}><MdAddLink style={{ color: '#9C27B0' }} /> Déconnexion</Link>
            ) : (
              <Link to="/new-connection"><MdAddLink style={{ color: '#9C27B0' }} /> Nouvelle connexion</Link>
            )}
          </li>
          <li><Link to="/cron-manager"><MdSchedule style={{ color: '#00BCD4' }} /> Gestion des Crons</Link></li>
        </ul>
      </nav>

      <main className="main-content">
        <NotificationManager />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/database" element={<DatabaseManager />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/restore" element={<Restore />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/new-connection" element={<NewConnection />} />
          <Route path="/cron-manager" element={<CronManager />} />
        </Routes>
      </main>

      {showLogoutConfirmation && (
        <LogoutConfirmation onConfirm={handleLogoutConfirm} onCancel={handleLogoutCancel} />
      )}
    </div>
  );
};

export default AppContent;