import '../assets/css/Historique.css';
import React, { useEffect, useState, useCallback } from 'react';
import { FaLock, FaSpinner, FaChevronLeft, FaChevronRight, FaDatabase, FaUndo, FaInfoCircle } from 'react-icons/fa';

const History = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBackupHistory = useCallback(async (page) => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/backup/history?page=${page}&limit=${itemsPerPage}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique des sauvegardes');
      }
      const data = await response.json();
      setBackups(data.history);
      setTotalItems(data.pagination.totalItems);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, itemsPerPage]);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    if (isLoggedIn) {
      fetchBackupHistory(currentPage);
    }
  }, [isLoggedIn, currentPage, fetchBackupHistory]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'save':
        return <FaDatabase className="action-icon save" title="Sauvegarde" />;
      case 'restore':
        return <FaUndo className="action-icon restore" title="Restauration" />;
      default:
        return action;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="history-container">
        <h1 className="history-title"><FaLock /> Accès Restreint</h1>
        <p className="history-description">Veuillez vous connecter pour accéder à l'historique des sauvegardes.</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1 className="history-title">Historique des sauvegardes</h1>
      <p className="history-description">Consultez l'historique détaillé de toutes les sauvegardes effectuées.</p>

      {loading && <div className="history-loading"><FaSpinner className="spinner" /> Chargement de l'historique...</div>}
      {error && <p className="history-error">{error}</p>}

      {!loading && !error && backups.length > 0 ? (
        <>
          <div className="legend">
            <FaInfoCircle className="legend-icon" /> Légende :
            <div className="legend-items">
              <span className="legend-item">
                <FaDatabase className="action-icon save" /> Sauvegarde
              </span>
              <span className="legend-item">
                <FaUndo className="action-icon restore" /> Restauration
              </span>
            </div>
          </div>
          <div className="table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Base de données</th>
                  <th>Chemin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td>{backup.backup_id}</td>
                    <td>{new Date(backup.timestamp).toLocaleString()}</td>
                    <td>{backup.database_name}</td>
                    <td>{backup.path}</td>
                    <td>{getActionIcon(backup.action)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <FaChevronLeft /> Précédent
            </button>
            <span className="page-info">Page {currentPage} sur {Math.ceil(totalItems / itemsPerPage)}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className="pagination-button"
            >
              Suivant <FaChevronRight />
            </button>
          </div>
        </>
      ) : (
        !loading && <p className="history-no-data">Aucune sauvegarde disponible pour le moment.</p>
      )}
    </div>
  );
};

export default History;