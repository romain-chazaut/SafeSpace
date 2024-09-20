import React, { useState, useEffect } from 'react';
import { FaClock, FaPlusCircle, FaTrashAlt, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import '../assets/css/Cron.css';

const CronManager = () => {
  const [crons, setCrons] = useState([]);
  const [newCron, setNewCron] = useState({ jobName: '', schedule: '', database: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCrons = async () => {
    try {
      const response = await fetch('http://localhost:3000/crons');
      const data = await response.json();
      setCrons(data.jobs);
    } catch (err) {
      setError('Erreur lors de la récupération des crons.');
    }
  };

  const addCron = async (e) => {
    e.preventDefault();
    if (!newCron.jobName || !newCron.schedule || !newCron.database) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/crons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCron),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess(result.message);
        setError('');
        fetchCrons();
        setNewCron({ jobName: '', schedule: '', database: '', description: '' });
      } else {
        setError(result.message);
        setSuccess('');
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du cron.');
      setSuccess('');
    }
  };

  const deleteCron = async (jobName) => {
    try {
      const response = await fetch(`http://localhost:3000/crons/${jobName}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess(result.message);
        fetchCrons();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors de la suppression du cron.');
    }
  };

  useEffect(() => {
    fetchCrons();
  }, []);

  return (
    <div className="cron-manager">
      <div className="cron-content">
        <h1><FaClock /> Gestion des Tâches Cron</h1>

        {error && <p className="error-message"><FaExclamationCircle /> {error}</p>}
        {success && <p className="success-message"><FaCheckCircle /> {success}</p>}

        <div className="cron-form">
          <h2><FaPlusCircle /> Ajouter une nouvelle tâche cron</h2>
          <form onSubmit={addCron}>
            <div className="form-group">
              <label htmlFor="jobName">Nom du job*</label>
              <input
                type="text"
                id="jobName"
                value={newCron.jobName}
                onChange={(e) => setNewCron({ ...newCron, jobName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="database">Nom de la base*</label>
              <input
                type="text"
                id="database"
                value={newCron.database}
                onChange={(e) => setNewCron({ ...newCron, database: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="schedule">Expression cron*</label>
              <input
                type="text"
                id="schedule"
                placeholder="Ex: 0 * * * *"
                value={newCron.schedule}
                onChange={(e) => setNewCron({ ...newCron, schedule: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newCron.description}
                onChange={(e) => setNewCron({ ...newCron, description: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Ajouter</button>
          </form>
        </div>

        <div className="cron-list">
          <h2>Tâches cron actives</h2>
          {crons.length > 0 ? (
            <ul>
              {crons.map((cron) => (
                <li key={cron}>
                  <span>{cron}</span>
                  <button onClick={() => deleteCron(cron)} className="delete-btn"><FaTrashAlt /> Supprimer</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucune tâche cron active.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CronManager;