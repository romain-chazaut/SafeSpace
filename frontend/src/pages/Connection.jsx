import React, { useEffect, useState } from 'react';
import { getConnections } from '../services/apiService';

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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Connexions</h1>
      <ul>
        {connections.map((connection) => (
          <li key={connection.id}>{connection.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Connections;
