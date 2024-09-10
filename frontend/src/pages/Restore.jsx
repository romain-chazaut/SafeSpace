import React from 'react';

const Restore = () => {
  return (
    <div>
      <h1>Restauration</h1>
      <p>Restaurer une base de données à partir d'une sauvegarde.</p>
      <button onClick={() => alert('Restauration effectuée !')}>Restaurer la sauvegarde</button>
    </div>
  );
};

export default Restore;
