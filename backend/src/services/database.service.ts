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
}