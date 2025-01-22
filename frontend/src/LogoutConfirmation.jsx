import React from 'react';
import './assets/css/logout.css'

const LogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="logout-confirmation">
      <div className="logout-confirmation-content">
        <h2>Confirmation de déconnexion</h2>
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="logout-confirmation-buttons">
          <button onClick={onConfirm}>Oui, me déconnecter</button>
          <button onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;