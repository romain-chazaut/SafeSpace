import { Pool, PoolConfig } from 'pg';

// Fonction pour créer un pool de connexion à la base de données PostgreSQL
export function createPool(config: PoolConfig = {}): Pool {
  return new Pool({
    user: process.env.DB_USER || 'postgres',           // Utilisateur de la DB
    host: process.env.DB_HOST || 'localhost',          // Hôte de la DB, par défaut 'localhost'
    database: process.env.DB_NAME || 'SafeBase',       // Nom de la base de données
    password: process.env.DB_PASSWORD || 'mysecretpassword', // Mot de passe de la DB
    port: parseInt(process.env.DB_PORT || '5432'),     // Port de la DB, par défaut 5432
    ...config                                          // Fusionner avec d'autres configurations passées en paramètre
  });
}

// Fonction pour tester la connexion à la base de données
export async function testConnection(pool: Pool): Promise<{ success: boolean; message: string; timestamp?: Date }> {
  let client = null;
  try {
    // Tenter de se connecter à la base de données
    client = await pool.connect();
    const result = await client.query('SELECT NOW()'); // Exécuter une requête pour vérifier l'état de la connexion
    return { success: true, message: 'Connected to the database', timestamp: result.rows[0].now }; // Succès
  } catch (err) {
    // En cas d'erreur, loguer et retourner un message d'échec
    console.error('Database connection error', err);
    return { success: false, message: 'Failed to connect to the database' };
  } finally {
    if (client) client.release(); // Libérer le client après utilisation
  }
}
