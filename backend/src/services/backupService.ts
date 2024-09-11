import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

interface DatabaseConfig {
  database: string;
}

export class BackupService {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(__dirname, '..', '..', 'backup');
  }

  private async execCommand(command: string, env: NodeJS.ProcessEnv): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, { env: { ...process.env, ...env } }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async createDump(dbConfig: DatabaseConfig): Promise<string> {
    console.log('Starting dump process...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dumpPath = path.join(this.backupDir, `dump_${dbConfig.database}_${timestamp}.sql`);

      console.log('Creating dump at:', dumpPath);

      await fs.mkdir(this.backupDir, { recursive: true });
      
      const dumpCommand = `docker exec -e PGPASSWORD=mysecretpassword postgres_container pg_dump -h db -p 5432 -U postgres -d ${dbConfig.database} > "${dumpPath}"`;
      
      await this.execCommand(dumpCommand, {});
      console.log('Dump created successfully');
      
      return dumpPath;
    } catch (error) {
      console.error('Error during database dump:', error);
      throw error;
    }
  }
}