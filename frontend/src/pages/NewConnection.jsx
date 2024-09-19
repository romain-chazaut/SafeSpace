import React, { useState } from 'react';
import { createConnection } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import '../assets/css/NewConnections.css';

const NewConnection = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const connectionData = { host, port: parseInt(port), database, user, password };

    try {
      const result = await createConnection(connectionData);
      setSuccess(`Connexion créée avec succès : ${result.host}`);
      setHost(''); setPort(''); setDatabase(''); setUser(''); setPassword('');
      setTimeout(() => navigate('/connections'), 2000); // Redirection après 2 secondes
    } catch (err) {
      setError('Erreur lors de la création de la connexion');
    }
  };

  return (
    <div className="main-content">
      <div className="centered-content new-connection">
        <h1>Créer une nouvelle connexion</h1>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Host :</label>
            <input 
              type="text" 
              value={host} 
              onChange={(e) => setHost(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Port :</label>
            <input 
              type="number" 
              value={port} 
              onChange={(e) => setPort(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Base de données :</label>
            <input 
              type="text" 
              value={database} 
              onChange={(e) => setDatabase(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Utilisateur :</label>
            <input 
              type="text" 
              value={user} 
              onChange={(e) => setUser(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
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
    </div>
  );
};

export default NewConnection;