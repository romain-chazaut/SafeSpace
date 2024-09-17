import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import { DatabaseConfig } from '../services/types';
import cron from 'node-cron'; // Import de node-cron

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

  // Méthode pour exécuter une commande shell
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

  // Méthode pour créer un dump
  async createDump(dbConfig: DatabaseConfig): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpPath = path.join(this.backupDir, `dump_${dbConfig.database}_${timestamp}.sql`);

    await fs.mkdir(this.backupDir, { recursive: true });
    
    const dumpCommand = `docker exec -e PGPASSWORD=mysecretpassword postgres_container pg_dump -h db -p 5432 -U postgres -d ${dbConfig.database} > "${dumpPath}"`;
    
    await this.execCommand(dumpCommand);
    
    return dumpPath;
  }

  // Méthode pour sauvegarder les infos du dump dans les tables `backup` et `backup_history`
  async saveBackupInfo(backupPath: string, dbConfig: DatabaseConfig): Promise<number> {
    const query = 'INSERT INTO backup (path, timestamp, action, name_database) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [backupPath, new Date(), 'save', dbConfig.database];

    const result = await this.pool.query(query, values);
    const backupId = result.rows[0].id;

    // Insérer dans la table backup_history
    const queryHistory = 'INSERT INTO backup_history (backup_id, path, timestamp, action, database_name) VALUES ($1, $2, $3, $4, $5)';
    const valuesHistory = [backupId, backupPath, new Date(), 'save', dbConfig.database];
    await this.pool.query(queryHistory, valuesHistory);

    return backupId;
  }

  // Méthode pour récupérer l'historique des backups
  async getBackupHistory(): Promise<any[]> {
    const query = 'SELECT * FROM backup_history ORDER BY timestamp DESC';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Méthode pour fermer les connexions à la base de données
  async close(): Promise<void> {
    await this.pool.end();
  }

  // Méthode pour démarrer le cron
  startCronJob(dbConfig: DatabaseConfig, schedule: string = '* * * * *') {
    cron.schedule(schedule, async () => {
      console.log('Exécution automatique de la sauvegarde selon le cron :', schedule);
      try {
        const backupPath = await this.createDump(dbConfig);
        await this.saveBackupInfo(backupPath, dbConfig);
        console.log('Sauvegarde automatique réussie');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique :', error);
      }
    });
    console.log('Tâche cron planifiée pour :', schedule);
  }
}
