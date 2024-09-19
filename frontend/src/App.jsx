import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MdDashboard, MdHistory, MdStorage, MdBackup, MdRestore, MdLink, MdAddLink } from 'react-icons/md';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Database from './pages/Database';
import Backup from './pages/Backup';
import Restore from './pages/Restore';
import Connections from './pages/Connection';
import NewConnection from './pages/NewConnection';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <ul>
            <li><Link to="/"><MdDashboard style={{ color: '#1E88E5' }} /> Dashboard</Link></li>
            <li><Link to="/history"><MdHistory style={{ color: '#FF9800' }} /> Historique</Link></li>
            <li><Link to="/database"><MdStorage style={{ color: '#673AB7' }} /> Bases de données</Link></li>
            <li><Link to="/backup"><MdBackup style={{ color: '#4CAF50' }} /> Backup</Link></li>
            <li><Link to="/restore"><MdRestore style={{ color: '#F44336' }} /> Restore</Link></li>
            <li><Link to="/connections"><MdLink style={{ color: '#FFC107' }} /> Connexions</Link></li>
            <li><Link to="/new-connection"><MdAddLink style={{ color: '#9C27B0' }} /> Nouvelle connexion</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/database" element={<Database />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/restore" element={<Restore />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/new-connection" element={<NewConnection />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;