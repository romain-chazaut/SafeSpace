import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDatabase, FaArrowAltCircleUp, FaSpinner, FaExclamationCircle, FaLock } from 'react-icons/fa';
import "../assets/css/Restore.css";

const RestoreComponent = () => {
  const [sourceDatabaseId, setSourceDatabaseId] = useState('');
  const [targetDatabaseName, setTargetDatabaseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
  }, []);

  const handleRestore = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await axios.post(`http://localhost:3000/restore/${sourceDatabaseId}`, {
        targetDatabaseName
      });
      setMessage({ type: 'success', content: 'Restauration réussie!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Erreur lors de la restauration. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="restore-manager">
        <div className="restore-content">
          <h1><FaLock /> Accès Restreint</h1>
          <p>Veuillez vous connecter pour accéder à la fonctionnalité de restauration de base de données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restore-manager">
      <div className="restore-content">
        <h1><FaArrowAltCircleUp /> Restauration de Base de Données</h1>
        <p className="feature-description">
          Restaurez rapidement vos bases de données à partir de sauvegardes précédentes. 
          Cette fonctionnalité vous permet de récupérer vos données en cas de perte ou 
          de corruption, garantissant ainsi la continuité de votre activité.
        </p>
        
        {message.content && (
          <p className={`message ${message.type}`}>
            {message.type === 'error' ? <FaExclamationCircle /> : null} {message.content}
          </p>
        )}
        
        <div className="restore-form">
          <h3><FaDatabase /> Restaurer une sauvegarde</h3>
          <form onSubmit={handleRestore}>
            <div className="form-group">
              <label htmlFor="sourceDatabaseId">ID de la sauvegarde source:</label>
              <input
                type="text"
                id="sourceDatabaseId"
                value={sourceDatabaseId}
                onChange={(e) => setSourceDatabaseId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="targetDatabaseName">Nom de la base de données cible:</label>
              <input
                type="text"
                id="targetDatabaseName"
                value={targetDatabaseName}
                onChange={(e) => setTargetDatabaseName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spin" /> : null} 
              {isLoading ? 'Restauration en cours...' : 'Restaurer la sauvegarde'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestoreComponent;