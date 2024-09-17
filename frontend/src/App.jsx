import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/history">Historique</Link></li>
          <li><Link to="/database">Bases de données</Link></li>
          <li><Link to="/backup">Backup</Link></li>
          <li><Link to="/restore">Restore</Link></li>
          <li><Link to="/connections">Connexions</Link></li>
          <li><Link to="/new-connection">Nouvelle connexion</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/database" element={<Database />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/restore" element={<Restore />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/new-connection" element={<NewConnection />} />
      </Routes>
    </Router>
  );
};

export default App;
