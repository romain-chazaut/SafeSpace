import '../assets/css/Historique.css';
import React, { useEffect, useState } from 'react';
import { FaLock } from 'react-icons/fa';

const History = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    if (isLoggedIn) {
      fetchBackupHistory();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/backup/history');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique des sauvegardes');
      }
      const data = await response.json();
      setBackups(data.history);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="history-container">
        <h1 className="history-title"><FaLock /> Accès Restreint</h1>
        <p className="history-description">Veuillez vous connecter pour accéder à l'historique des sauvegardes.</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1 className="history-title">Historique des sauvegardes</h1>
      <p className="history-description">Consultez l'historique détaillé de toutes les sauvegardes effectuées.</p>

      {loading && <p className="history-loading">Chargement de l'historique...</p>}
      {error && <p className="history-error">{error}</p>}

      {!loading && !error && backups.length > 0 ? (
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Base de données</th>
                <th>Chemin</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td>{backup.backup_id}</td>
                  <td>{new Date(backup.timestamp).toLocaleString()}</td>
                  <td>{backup.database_name}</td>
                  <td>{backup.path}</td>
                  <td>{backup.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="history-no-data">Aucune sauvegarde disponible pour le moment.</p>
      )}
    </div>
  );
};

export default History;