import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Backup.css';

const Backup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleBackup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database: 'postgres' }),
      });

      if (response.ok) {
        navigate('/history');
      } else {
        setError('Erreur lors du lancement de la sauvegarde.');
      }
    } catch (error) {
      setError('Une erreur est survenue : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="centered-content backup">
        <h1>Backup</h1>
        <p>Lancer une sauvegarde manuelle des bases de données.</p>
        <button onClick={handleBackup} disabled={loading}>
          {loading ? 'Sauvegarde en cours...' : 'Lancer une sauvegarde'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Backup;