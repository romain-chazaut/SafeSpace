import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDatabase, FaServer, FaUser, FaLock, FaPlug, FaUnlink, FaCheckCircle } from 'react-icons/fa';
import "../assets/css/NewConnections.css";

const DatabaseConnection = () => {
  const [config, setConfig] = useState({
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const storedConfig = localStorage.getItem('databaseConfig');
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setConfig(prevConfig => ({
        ...prevConfig,
        host: parsedConfig.host,
        port: parsedConfig.port,
        database: parsedConfig.database,
      }));
    }
    const wasConnected = localStorage.getItem('isLoggedIn') === 'true';
    setIsConnected(wasConnected);
  }, []);

  const handleConnect = async (configToUse = config) => {
    try {
      await axios.post('http://localhost:3000/connect', configToUse);
      setIsConnected(true);
      localStorage.setItem('databaseConfig', JSON.stringify({
        host: configToUse.host,
        port: configToUse.port,
        database: configToUse.database,
      }));
      localStorage.setItem('isLoggedIn', 'true');
      setMessage({ type: 'success', content: 'Connecté à la base de données avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', content: 'Échec de la connexion à la base de données.' });
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post('http://localhost:3000/disconnect');
      setIsConnected(false);
      localStorage.removeItem('databaseConfig');
      localStorage.setItem('isLoggedIn', 'false');
      setConfig(prevConfig => ({
        ...prevConfig,
        user: '',
        password: '',
      }));
      setMessage({ type: 'success', content: 'Déconnecté de la base de données.' });
    } catch (error) {
      setMessage({ type: 'error', content: 'Échec de la déconnexion.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  return (
    <div className="main-content">
      <div className="centered-content new-connection">
        <h1><FaDatabase /> Connexion à la Base de Données</h1>
        {isConnected ? (
          <div className="connection-status">
            <p className="description">
              <FaCheckCircle /> Vous êtes actuellement connecté à la base de données.
            </p>
            <button onClick={handleDisconnect}><FaUnlink /> Se déconnecter</button>
          </div>
        ) : (
          <>
            <p className="description">
              <FaServer /> Configurez votre connexion à la base de données PostgreSQL ici.
            </p>
            {message.content && (
              <div className={`message ${message.type}`}>
                {message.content}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }}>
              <div className="form-group">
                <label htmlFor="host"><FaServer /> Hôte</label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  placeholder="Exemple: localhost"
                  value={config.host}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="port"><FaPlug /> Port</label>
                <input
                  type="number"
                  id="port"
                  name="port"
                  placeholder="Exemple: 5432"
                  value={config.port}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="database"><FaDatabase /> Base de données</label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  placeholder="Nom de la base de données"
                  value={config.database}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="user"><FaUser /> Utilisateur</label>
                <input
                  type="text"
                  id="user"
                  name="user"
                  placeholder="Nom d'utilisateur"
                  value={config.user}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password"><FaLock /> Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={config.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit"><FaPlug /> Se connecter</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseConnection;