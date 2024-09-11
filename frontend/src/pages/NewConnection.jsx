import React, { useState } from 'react';
import { createConnection } from '../services/apiService';
import { useNavigate } from 'react-router-dom';  // Importer pour rediriger après création

const NewConnection = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();  // Initialiser useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    const connectionData = { host, port: parseInt(port), database, user, password };

    try {
      const result = await createConnection(connectionData);
      setSuccess(`Connexion créée avec succès : ${result.host}`);
      setHost(''); setPort(''); setDatabase(''); setUser(''); setPassword('');  // Réinitialiser le formulaire

      // Rediriger vers la page des connexions après la création
      navigate('/connections');
    } catch (err) {
      setError('Erreur lors de la création de la connexion');
    }
  };

  return (
    <div>
      <h1>Créer une nouvelle connexion</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Host :</label>
          <input 
            type="text" 
            value={host} 
            onChange={(e) => setHost(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Port :</label>
          <input 
            type="number" 
            value={port} 
            onChange={(e) => setPort(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Base de données :</label>
          <input 
            type="text" 
            value={database} 
            onChange={(e) => setDatabase(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Utilisateur :</label>
          <input 
            type="text" 
            value={user} 
            onChange={(e) => setUser(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default NewConnection;
