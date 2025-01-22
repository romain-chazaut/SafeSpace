// services/connectionServiceList.ts
import { DatabaseService } from '../services/database.service';

class ConnectionService {
  static getConnectionsAll() {
    throw new Error('Method not implemented.');
  }
  constructor(private databaseService: DatabaseService) {}

  async getConnectionsAll() {
    try {
      const pool = this.databaseService.getPool();
      const query = `
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
          datname = current_database()
      `;
      
      console.log('Executing query:', query);
      const result = await pool.query(query);
      console.log('Query result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getConnectionsAll:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
}

export default ConnectionService;