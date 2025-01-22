import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaLock, FaSync } from 'react-icons/fa';
import '../assets/css/Connections.css'; // Assurez-vous de créer ce fichier CSS

const ConnectionsList = () => {
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnectionStatus = () => {
      const databaseConfig = localStorage.getItem('databaseConfig');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsConnected(loggedIn && !!databaseConfig);
    };

    checkConnectionStatus();
    if (isConnected) {
      fetchConnections();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/connections');
      setConnections(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="connections-container">
        <h1 className="connections-title"><FaLock /> Accès Restreint</h1>
        <p className="connections-description">Veuillez vous connecter à une base de données pour voir la liste des connexions.</p>
      </div>
    );
  }

  return (
    <div className="connections-container">
      <h1 className="connections-title">Liste des Connexions</h1>
      <p className="connections-description">Consultez les connexions actives à votre base de données.</p>
      <button className="refresh-button" onClick={fetchConnections}>
        <FaSync /> Rafraîchir les Connexions
      </button>
      {loading && <p className="connections-loading">Chargement des connexions...</p>}
      {error && <p className="connections-error">{error}</p>}
      {!loading && connections.length > 0 ? (
        <div className="table-container">
          <table className="connections-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Utilisateur</th>
                <th>Application</th>
                <th>Adresse Client</th>
                <th>Hôte Client</th>
                <th>Port Client</th>
                <th>Début</th>
                <th>État</th>
                <th>Requête</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn, index) => (
                <tr key={index}>
                  <td>{conn.pid}</td>
                  <td>{conn.usename}</td>
                  <td>{conn.application_name}</td>
                  <td>{conn.client_addr}</td>
                  <td>{conn.client_hostname}</td>
                  <td>{conn.client_port}</td>
                  <td>{new Date(conn.backend_start).toLocaleString()}</td>
                  <td>{conn.state}</td>
                  <td className="query-cell">{conn.query}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="connections-no-data">Aucune connexion trouvée</p>
      )}
    </div>
  );
};

export default ConnectionsList