const API_URL = 'http://localhost:3000';  

// Récupérer toutes les connexions
export const getConnections = async () => {
  const response = await fetch(`${API_URL}/connections`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des connexions');
  }
  return await response.json();
};

// Créer une nouvelle connexion
export const createConnection = async (connectionData) => {
  const response = await fetch(`${API_URL}/connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(connectionData),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la création de la connexion');
  }
  return await response.json();
};
