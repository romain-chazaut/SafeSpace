import React, { useState, useEffect } from 'react';

const CronManager = () => {
  const [crons, setCrons] = useState([]);
  const [newCron, setNewCron] = useState({ jobName: '', schedule: '', database: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fonction pour récupérer la liste des tâches cron
  const fetchCrons = async () => {
    try {
      const response = await fetch('http://localhost:3000/crons');
      const data = await response.json();
      setCrons(data.jobs);
    } catch (err) {
      setError('Erreur lors de la récupération des crons.');
    }
  };

  // Fonction pour ajouter une nouvelle tâche cron
  const addCron = async () => {
    if (!newCron.jobName || !newCron.schedule || !newCron.database) {
      setError('Tous les champs (Nom du job, Expression cron, Base de données) sont requis.');
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
        fetchCrons(); // Met à jour la liste des crons
        setNewCron({ jobName: '', schedule: '', database: '' }); // Réinitialiser le formulaire
      } else {
        setError(result.message);
        setSuccess('');
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du cron.');
      setSuccess('');
    }
  };

  // Fonction pour supprimer une tâche cron
  const deleteCron = async (jobName) => {
    try {
      const response = await fetch(`http://localhost:3000/crons/${jobName}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess(result.message);
        fetchCrons(); // Met à jour la liste des crons après suppression
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
    <div>
      <h1>Gestion des Tâches Cron</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <h2>Ajouter une nouvelle tâche cron</h2>
      <input
        type="text"
        placeholder="Nom du job"
        value={newCron.jobName}
        onChange={(e) => setNewCron({ ...newCron, jobName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Nom de la base"
        value={newCron.database}
        onChange={(e) => setNewCron({ ...newCron, database: e.target.value })}
      />
      <input
        type="text"
        placeholder="Expression cron (Ex: 0 * * * *)"
        value={newCron.schedule}
        onChange={(e) => setNewCron({ ...newCron, schedule: e.target.value })}
      />
      <button onClick={addCron}>Ajouter</button>

      <h2>Tâches cron actives</h2>
      <ul>
        {crons.map((cron) => (
          <li key={cron}>
            {cron} <button onClick={() => deleteCron(cron)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CronManager;
