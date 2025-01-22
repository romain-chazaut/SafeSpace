import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaDatabase, FaSpinner, FaExclamationCircle, FaLock, FaCheckCircle } from 'react-icons/fa';
import '../assets/css/Database.css';
import { AuthContext } from '../AuthContext';


const DatabaseManager = () => {
  const { isLoggedIn } = useContext(AuthContext)
  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [databaseContents, setDatabaseContents] = useState(null);
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDatabases();
      fetchCurrentDatabase();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchCurrentDatabase = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/current-database');
      setCurrentDatabase(response.data.currentDatabase);
    } catch (error) {
      console.error('Error fetching current database:', error);
      toast.error('Erreur lors de la récupération de la base de données actuelle');
    }
  };

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/databases');
      setDatabases(response.data.databases);
    } catch (error) {
      setError('Erreur lors de la récupération des bases de données');
      toast.error('Erreur lors de la récupération des bases de données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/databases', { databaseName: newDatabaseName });
      setNewDatabaseName('');
      fetchDatabases();
      toast.success(`Base de données ${newDatabaseName} créée avec succès!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      setError(`Erreur lors de la création de la base de données ${newDatabaseName}`);
      toast.error(`Erreur lors de la création de la base de données ${newDatabaseName}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDatabaseClick = async (dbName) => {
    try {
      await axios.post('http://localhost:3000/api/set-current-database', { databaseName: dbName });
      setCurrentDatabase(dbName);
      const response = await axios.get('http://localhost:3000/api/database-contents', { params: { databaseName: dbName } });
      setDatabaseContents(response.data);
      toast.info(`Vous êtes maintenant connecté à la base de données ${dbName}`);
    } catch (error) {
      setError(`Erreur lors de la récupération du contenu de la base de données ${dbName}`);
      toast.error(`Erreur lors de la récupération du contenu de la base de données ${dbName}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="backup-container">
        <h1 className="backup-title">
          <FaLock /> Accès Restreint
        </h1>
        <p className="backup-description">
          Veuillez vous connecter pour accéder à la fonctionnalité de gestion des bases de données.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="database-manager">
        <h2><FaSpinner className="spinner" /> Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="database-manager">
      <ToastContainer />
      <h2><FaDatabase /> {' '} Gestionnaire de bases de données</h2>
      {error && <p className="error-message"><FaExclamationCircle /> {error}</p>}
      <p>Base de données actuelle : <strong>{currentDatabase || 'Aucune'}</strong></p>
      
      <h3>Bases de données existantes</h3>
      <div className="database-list-container">
        <ul className="database-list">
          {databases.map(db => (
            <li 
              key={db} 
              className={`database-item ${db === currentDatabase ? 'current-database' : ''}`}
              onClick={() => handleDatabaseClick(db)}
            >
              {db === currentDatabase && <FaCheckCircle className="current-indicator" />}
              {' '}{db}
            </li>
          ))}
        </ul>
      </div>
      
      <h3>Créer une nouvelle base de données</h3>
      <form onSubmit={handleCreateDatabase} className="create-database-form">
        <input
          type="text"
          value={newDatabaseName}
          onChange={(e) => setNewDatabaseName(e.target.value)}
          placeholder="Nom de la nouvelle base de données"
          required
        />
        <button type="submit">Créer</button>
      </form>
      
      {databaseContents && (
        <div className="database-contents">
          <h3>Contenu de la base de données {currentDatabase}</h3>
          {databaseContents.tables.map(table => (
            <div key={table} className="table-content">
              <h4>{table}</h4>
              <table>
                <thead>
                  <tr>
                    {Object.keys(databaseContents.contents[table][0] || {}).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {databaseContents.contents[table].map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;