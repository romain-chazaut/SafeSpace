import React, { useEffect, useState } from 'react';
import { getConnections } from '../services/apiService';
import '../assets/css/Connections.css';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const result = await getConnections();
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
              <li key={connection.id}>
                {connection.host}:{connection.port} - {connection.database}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Connections;