import React, { useEffect, useState } from 'react';

const History = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour récupérer l'historique des sauvegardes
  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/backup/history');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique des sauvegardes');
      }
      const data = await response.json();
      setBackups(data.history); // Assumes the response has a "history" field
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Utilisation de useEffect pour lancer l'appel API au chargement du composant
  useEffect(() => {
    fetchBackupHistory();
  }, []);

  return (
    <div>
      <h1>Historique des sauvegardes</h1>
      <p>Ici, vous pouvez consulter l'historique de toutes les sauvegardes effectuées.</p>

      {loading && <p>Chargement de l'historique...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && backups.length > 0 ? (
        <ul>
          {backups.map((backup, index) => (
            <li key={index}>
              Sauvegarde {backup.id} - {new Date(backup.timestamp).toLocaleDateString()} - {backup.database_name}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>Aucune sauvegarde disponible pour le moment.</p>
      )}
    </div>
  );
};

export default History;
