import React from 'react';

const Backup = () => {
  return (
    <div>
      <h1>Backup</h1>
      <p>Lancer une sauvegarde manuelle des bases de données.</p>
      <button onClick={() => alert('Sauvegarde lancée !')}>Lancer une sauvegarde</button>
    </div>
  );
};

export default Backup;
