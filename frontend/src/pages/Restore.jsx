import React from 'react';
import '../assets/css/Restore.css';

const Restore = () => {
  const handleRestore = () => {
    alert('Restauration effectuée !');
    // Ici, vous pouvez ajouter la logique réelle de restauration
  };

  return (
    <div className="main-content">
      <div className="centered-content restore">
        <h1>Restauration</h1>
        <p>Restaurer une base de données à partir d'une sauvegarde.</p>
        <button onClick={handleRestore}>Restaurer la sauvegarde</button>
      </div>
    </div>
  );
};

export default Restore;