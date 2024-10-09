import { Pool, PoolConfig } from 'pg';

export class DatabaseService {
  private pool: Pool | null = null;

  async connect(config: PoolConfig): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
    this.pool = new Pool(config);
    try {
      const client = await this.pool.connect();
      console.log('Connected to database');
      client.release();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Disconnected from database');
    }
  }
    async getDatabaseContents(): Promise<any> {
    try {
      // Get all tables
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      const tablesResult = await this.getPool().query(tablesQuery);
      const tables = tablesResult.rows.map(row => row.table_name);

      // Get contents of each table
      const contents: { [key: string]: any[] } = {};
      for (const table of tables) {
        const contentQuery = `SELECT * FROM "${table}" LIMIT 100;`;
        const contentResult = await this.getPool().query(contentQuery);
        contents[table] = contentResult.rows;
      }

      return { tables, contents };
    } catch (error) {
      console.error('Error fetching database contents:', error);
      throw error;
    }
  }

  async createNewConnection(databaseName: string): Promise<Pool> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    const newConfig = { ...this.pool.options, database: databaseName };
    return new Pool(newConfig);
  }

  
  setPool(newPool: Pool): void {
    if (this.pool) {
      this.pool.end(); // Close the old pool
    }
    this.pool = newPool;
  }
  
}