import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabaseConnection = () => {
  const [config, setConfig] = useState({
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: '',
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vérifier le localStorage au chargement du composant
    const storedConfig = localStorage.getItem('databaseConfig');
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setConfig(parsedConfig);
      handleConnect(parsedConfig);
    }
  }, []);

  const handleConnect = async (configToUse = config) => {
    try {
      await axios.post('http://localhost:3000/connect', configToUse);
      setIsConnected(true);
      localStorage.setItem('databaseConfig', JSON.stringify(configToUse));
      localStorage.setItem('isLoggedIn', 'true'); // Ajouter cette ligne
      alert('Connected to database');
    } catch (error) {
      alert('Failed to connect to database');
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post('http://localhost:3000/disconnect');
      setIsConnected(false);
      localStorage.removeItem('databaseConfig');
      localStorage.setItem('isLoggedIn', 'false'); // Ajouter cette ligne
      alert('Disconnected from database');
    } catch (error) {
      alert('Failed to disconnect from database');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  return (
    <div>
      <h2>Database Connection</h2>
      <input
        type="text"
        name="host"
        placeholder="Host"
        value={config.host}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="port"
        placeholder="Port"
        value={config.port}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="database"
        placeholder="Database"
        value={config.database}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="user"
        placeholder="User"
        value={config.user}
        onChange={handleInputChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={config.password}
        onChange={handleInputChange}
      />
      {!isConnected ? (
        <button onClick={() => handleConnect()}>Connect</button>
      ) : (
        <button onClick={handleDisconnect}>Disconnect</button>
      )}
    </div>
  );
};

export default DatabaseConnection;