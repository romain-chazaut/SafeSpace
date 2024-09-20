import React, { useState } from 'react';
import { createConnection } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { FaDatabase, FaServer, FaUser, FaLock, FaInfoCircle } from 'react-icons/fa';
import '../assets/css/NewConnections.css';

const NewConnection = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [dbType, setDbType] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const connectionData = { host, port: parseInt(port), database, user, password, dbType };

    try {
      const result = await createConnection(connectionData);
      setSuccess(`Connexion créée avec succès : ${result.host}`);
      setHost(''); setPort(''); setDatabase(''); setUser(''); setPassword(''); setDbType('');
      setTimeout(() => navigate('/connections'), 2000);
    } catch (err) {
      setError('Erreur lors de la création de la connexion');
    }
  };

  return (
    <div className="main-content">
      <div className="centered-content new-connection">
        <h1><FaDatabase /> Créer une nouvelle connexion</h1>
        <p className="description">
          <FaInfoCircle /> Configurez une nouvelle connexion à votre base de données. 
          Cette connexion vous permettra d'accéder et de gérer vos données de manière sécurisée.
        </p>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FaServer /> Host :</label>
            <input 
              type="text" 
              value={host} 
              onChange={(e) => setHost(e.target.value)} 
              required 
              placeholder="ex: localhost"
            />
          </div>
          <div className="form-group">
            <label><FaServer /> Port :</label>
            <input 
              type="number" 
              value={port} 
              onChange={(e) => setPort(e.target.value)} 
              required 
              placeholder="ex: 5432"
            />
          </div>
          <div className="form-group">
            <label><FaDatabase /> Type de base de données :</label>
            <select 
              value={dbType} 
              onChange={(e) => setDbType(e.target.value)} 
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="oracle">Oracle</option>
            </select>
          </div>
          <div className="form-group">
            <label><FaDatabase /> Base de données :</label>
            <input 
              type="text" 
              value={database} 
              onChange={(e) => setDatabase(e.target.value)} 
              required 
              placeholder="Nom de la base de données"
            />
          </div>
          <div className="form-group">
            <label><FaUser /> Utilisateur :</label>
            <input 
              type="text" 
              value={user} 
              onChange={(e) => setUser(e.target.value)} 
              required 
              placeholder="Nom d'utilisateur"
            />
          </div>
          <div className="form-group">
            <label><FaLock /> Mot de passe :</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Mot de passe"
            />
          </div>
          <button type="submit">Créer la connexion</button>
        </form>
      </div>
    </div>
  );
};

export default NewConnection;