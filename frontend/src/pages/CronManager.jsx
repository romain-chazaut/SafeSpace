import React, { useState, useEffect } from 'react';
import { FaClock, FaPlusCircle, FaTrashAlt, FaExclamationCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import '../assets/css/Cron.css';

const CronManager = () => {
  const [crons, setCrons] = useState([]);
  const [newCron, setNewCron] = useState({ jobName: '', schedule: '', database: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const predefinedSchedules = [
    { label: '1 minute', value: '*/1 * * * *', description: 'Tâche exécutée toutes les minutes' },
    { label: '1 heure', value: '0 */1 * * *', description: 'Tâche exécutée toutes les heures' },
    { label: '3 heures', value: '0 */3 * * *', description: 'Tâche exécutée toutes les 3 heures' },
    { label: '5 heures', value: '0 */5 * * *', description: 'Tâche exécutée toutes les 5 heures' },
    { label: '24 heures', value: '0 0 * * *', description: 'Tâche exécutée tous les jours à minuit' },
    { label: '1 semaine', value: '0 0 * * 0', description: 'Tâche exécutée chaque semaine le dimanche à minuit' },
    { label: '1 mois', value: '0 0 1 * *', description: 'Tâche exécutée le premier jour de chaque mois à minuit' },
    { label: '1 année', value: '0 0 1 1 *', description: 'Tâche exécutée le 1er janvier à minuit' },
  ];

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    if (isLoggedIn) {
      fetchCrons();
    }
  }, [isLoggedIn]);

  const fetchCrons = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch('http://localhost:3000/crons');
      if (response.ok) {
        const data = await response.json();
        // Ensure that crons is always an array of objects
        const formattedCrons = data.jobs.map(cron => {
          if (typeof cron === 'string') {
            return { jobName: cron, schedule: '', description: '' };
          }
          return cron;
        });
        setCrons(formattedCrons);
      } else {
        throw new Error('Erreur lors de la récupération des crons');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des crons.');
    }
  };

  const addCron = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Vous devez être connecté pour ajouter une tâche cron.');
      return;
    }

    if (!newCron.jobName || !newCron.schedule || !newCron.database) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    const databaseConfig = JSON.parse(localStorage.getItem('databaseConfig') || '{}');

    try {
      const response = await fetch('http://localhost:3000/crons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobName: newCron.jobName,
          schedule: newCron.schedule,
          dbConfig: {
            ...databaseConfig,
            database: newCron.database
          },
          description: newCron.description
        }),
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
    if (!isLoggedIn) {
      setError('Vous devez être connecté pour supprimer une tâche cron.');
      return;
    }

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

  const handleScheduleChange = (e) => {
    const selectedSchedule = predefinedSchedules.find(schedule => schedule.value === e.target.value);
    setNewCron({
      ...newCron,
      schedule: selectedSchedule.value,
      description: selectedSchedule.description
    });
  };

  if (!isLoggedIn) {
    return <p>Veuillez vous connecter pour gérer les tâches cron.</p>;
  }

  return (
    <div className="cron-container">
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
            <label htmlFor="schedule">Fréquence d'exécution*</label>
            <select
              id="schedule"
              value={newCron.schedule}
              onChange={handleScheduleChange}
              required
            >
              <option value="">Sélectionnez une fréquence</option>
              {predefinedSchedules.map((schedule) => (
                <option key={schedule.value} value={schedule.value}>
                  {schedule.label}
                </option>
              ))}
            </select>
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
              <li key={cron.jobName} className="cron-item">
                <div className="cron-info">
                  <strong>{cron.jobName}</strong>
                  {cron.schedule && <span className="cron-schedule">{cron.schedule}</span>}
                  {cron.description && (
                    <p className="cron-description">
                      <FaInfoCircle /> {cron.description}
                    </p>
                  )}
                </div>
                <button onClick={() => deleteCron(cron.jobName)} className="delete-btn">
                  <FaTrashAlt /> Supprimer
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune tâche cron active.</p>
        )}
      </div>
    </div>
  );
};

export default CronManager;