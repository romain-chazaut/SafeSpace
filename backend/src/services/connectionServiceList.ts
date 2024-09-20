// services/connectionServiceList.ts
import { Pool } from 'pg';

class ConnectionService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_NAME ?? 'SafeBase',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'mysecretpassword',
    });
  }

  async getConnectionsAll() {
    try {
      console.log('Étape 1: Vérification de l\'existence de pg_stat_activity');
      const checkViewQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.views 
          WHERE table_schema = 'pg_catalog' 
          AND table_name = 'pg_stat_activity'
        );
      `;
      const viewExists = await this.pool.query(checkViewQuery);
      if (!viewExists.rows[0].exists) {
        throw new Error('La vue pg_stat_activity n\'existe pas');
      }

      console.log('Étape 2: Vérification des permissions');
      const permissionQuery = `
        SELECT has_table_privilege(current_user, 'pg_stat_activity', 'SELECT');
      `;
      const hasPermission = await this.pool.query(permissionQuery);
      if (!hasPermission.rows[0].has_table_privilege) {
        throw new Error('L\'utilisateur n\'a pas les permissions nécessaires sur pg_stat_activity');
      }

      console.log('Étape 3: Exécution de la requête principale');
      const mainQuery = `
        SELECT 
          pid,
          usename,
          application_name,
          client_addr,
          client_hostname,
          client_port,
          backend_start,
          state,
          query
        FROM 
          pg_stat_activity
        WHERE 
          datname = $1
      `;
      
      const result = await this.pool.query(mainQuery, [process.env.DB_NAME || 'SafeBase']);
      console.log('Requête exécutée avec succès. Nombre de lignes:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('Erreur détaillée lors de la récupération des connexions:', error);
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }
}

export default new ConnectionService();