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

// Lancer une sauvegarde
export const launchBackup = async (databaseName) => {
  const response = await fetch(`${API_URL}/backup/create-new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ database: databaseName }),
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la sauvegarde');
  }
  return await response.json();
};

export const getConnectionAll = async () => {
  const response = await axios.get(`${API_URL}/connectionsAll`);
  console.log(response.data.connections);
  return response.data.connections;
};