import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import { DatabaseConfig } from '../services/types';

export class BackupService {
  private backupDir: string;
  private pool: Pool;

  constructor() {
    this.backupDir = path.join(__dirname, '..', '..', 'backup');
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'SafeBase',
      user: 'postgres',
      password: 'mysecretpassword'
    });
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

  async createDump(dbConfig: DatabaseConfig): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpPath = path.join(this.backupDir, `dump_${dbConfig.database}_${timestamp}.sql`);

    await fs.mkdir(this.backupDir, { recursive: true });
    
    const dumpCommand = `docker exec -e PGPASSWORD=mysecretpassword postgres_container pg_dump -h db -p 5432 -U postgres -d ${dbConfig.database} > "${dumpPath}"`;
    
    await this.execCommand(dumpCommand);
    
    return dumpPath;
  }

  async saveBackupInfo(backupPath: string, dbConfig: DatabaseConfig): Promise<number> {
    const query = 'INSERT INTO backup (path, timestamp, action, name_database) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [backupPath, new Date(), 'save', dbConfig.database];

    const result = await this.pool.query(query, values);

    // Insérer dans la table backup_history
    const backupId = result.rows[0].id;
    const queryHistory = 'INSERT INTO backup_history (backup_id, path, timestamp, action, database_name) VALUES ($1, $2, $3, $4, $5)';
    const valuesHistory = [backupId, backupPath, new Date(), 'save', dbConfig.database];
    await this.pool.query(queryHistory, valuesHistory);

    return backupId;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
