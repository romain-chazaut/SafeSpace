import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDatabase, FaSpinner, FaExclamationCircle, FaLock, FaCheckCircle } from 'react-icons/fa';
import '../assets/css/Backup.css';

const Backup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
  }, []);

  const handleBackup = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Vous devez être connecté pour effectuer une sauvegarde.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:3000/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database: databaseName }),
      });

      if (response.ok) {
        setSuccess('Sauvegarde réussie ! Redirection vers l\'historique...');
        setTimeout(() => {
          navigate('/history');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Erreur lors du lancement de la sauvegarde.');
      }
    } catch (error) {
      setError('Une erreur est survenue : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="backup-container">
        <h1 className="backup-title">
          <FaLock /> Accès Restreint
        </h1>
        <p className="backup-description">
          Veuillez vous connecter pour accéder à la fonctionnalité de sauvegarde de base de données.
        </p>
      </div>
    );
  }

  return (
    <div className="backup-container">
      <h1 className="backup-title">
        <FaDatabase /> Backup
      </h1>
      <p className="backup-description">
        Gérez et planifiez vos sauvegardes de bases de données en toute simplicité.
        Assurez-vous que vos données sont protégées contre les pertes accidentelles,
        les pannes matérielles ou les erreurs humaines. Un bon plan de sauvegarde
        est essentiel pour la continuité de votre activité.
      </p>
      
      <form onSubmit={handleBackup} className="backup-form">
        <label htmlFor="database-name">
          <FaDatabase /> Nom de la base de données :
        </label>
        <input
          type="text"
          id="database-name"
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
          required
        />
        
        <button type="submit" className="backup-button" disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="spin" /> Sauvegarde en cours...
            </>
          ) : (
            'Lancer une sauvegarde'
          )}
        </button>
      </form>
      
      {error && (
        <div className="backup-error">
          <FaExclamationCircle /> {error}
        </div>
      )}
      {success && (
        <div className="backup-success">
          <FaCheckCircle /> {success}
        </div>
      )}
    </div>
  );
};

export default Backup;