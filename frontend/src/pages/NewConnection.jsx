import React, { useState } from 'react';
import { createConnection } from '../services/apiService';

const NewConnection = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const connectionData = { name, status };

    try {
      const result = await createConnection(connectionData);
      setSuccess('Connexion créée avec succès');
      setName('');  // Reset du formulaire
      setStatus('');
    } catch (err) {
      setError('Erreur lors de la création de la connexion');
    }
  };

  return (
    <div>
      <h1>Créer une nouvelle connexion</h1>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom :</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Status :</label>
          <input 
            type="text" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default NewConnection;
