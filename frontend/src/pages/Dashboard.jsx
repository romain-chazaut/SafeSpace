import React from 'react';
import { MdDashboard, MdBackup, MdRestore, MdSchedule } from 'react-icons/md';
import '../assets/css/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Tableau de Bord SafeBase</h1>
        <p className="dashboard-welcome">Bienvenue sur votre centre de contrôle pour la gestion de bases de données et sauvegardes.</p>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <MdBackup className="card-icon" />
            <h2>Sauvegardes</h2>
            <p>Gérez et planifiez vos sauvegardes de bases de données en toute simplicité.</p>
          </div>
          <div className="dashboard-card">
            <MdRestore className="card-icon" />
            <h2>Restaurations</h2>
            <p>Restaurez rapidement vos bases de données à partir de sauvegardes précédentes.</p>
          </div>
          <div className="dashboard-card">
            <MdSchedule className="card-icon" />
            <h2>Tâches Cron</h2>
            <p>Automatisez vos opérations de sauvegarde et de maintenance.</p>
          </div>
          <div className="dashboard-card">
            <MdDashboard className="card-icon" />
            <h2>Aperçu Rapide</h2>
            <p>Visualisez l'état de vos bases de données et sauvegardes en un coup d'œil.</p>
          </div>
        </div>

        <div className="dashboard-summary">
          <h2>Résumé de l'Activité</h2>
          <ul>
            <li>Dernière sauvegarde : <strong>Il y a 2 heures</strong></li>
            <li>Prochaine sauvegarde planifiée : <strong>Dans 4 heures</strong></li>
            <li>Nombre total de bases de données : <strong>12</strong></li>
            <li>Espace de stockage utilisé : <strong>45 GB</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;