// src/components/Connections.js
import React, { useEffect, useState } from 'react';
import { getConnectionAll, getConnections } from '../services/apiService';
import '../assets/css/Connections.css';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const result = await getConnectionAll();
        console.log(result);
        setConnections(result);
      } catch (err) {
        setError('Erreur lors de la récupération des connexions');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  return (
    <div className="main-content">
      <div className="centered-content connections">
        <h1>Liste des connexions</h1>
        {loading && <div className="loading">Chargement...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <ul>
            {connections.map((connection) => (
              <li key={connection.pid}>
                {connection.user} - {connection.database} ({connection.client_addr}:{connection.client_port})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Connections;