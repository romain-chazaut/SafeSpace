import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import { DatabaseConfig, BackupResult } from '../services/types';

export class BackupService {
  private backupDir: string;
  private pool: Pool;

  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backup');
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'SafeSpace',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'mysecretpassword'
    });

    console.log(`Attempting to connect to database at ${this.pool.options.host}:${this.pool.options.port}`);
  }

  private async execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async createDumpAndSaveInfo(dbConfig: DatabaseConfig): Promise<BackupResult> {
    console.log('Starting dump process...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dumpPath = path.join(this.backupDir, `dump_${dbConfig.database}_${timestamp}.sql`);

      console.log('Creating dump at:', dumpPath);

      await fs.mkdir(this.backupDir, { recursive: true });
      
      const dumpCommand = `docker exec -e PGPASSWORD=${this.pool.options.password} postgres_container pg_dump -h ${this.pool.options.host} -p ${this.pool.options.port} -U ${this.pool.options.user} -d ${dbConfig.database} > "${dumpPath}"`;
      
      await this.execCommand(dumpCommand);
      console.log('Dump created successfully');

      const query = 'INSERT INTO backup (path, timestamp, action, name_database) VALUES ($1, $2, $3, $4) RETURNING id';
      const values = [dumpPath, new Date(), 'save', dbConfig.database];

      const result = await this.pool.query(query, values);
      const backupId = result.rows[0].id;
      console.log(`Backup information saved with ID: ${backupId}`);
      
      return { dumpPath, backupId };
    } catch (error) {
      console.error('Error during database dump and info saving:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    console.log('Closing database connection...');
    await this.pool.end();
    console.log('Database connection closed.');
  }
}