import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export class BackupServiceSave {
  private pool: Pool;
  private backupDir: string;

  constructor() {
    this.pool = new Pool({
      host: 'db',
      port: 5432,
      database: 'SafeBase',
      user: 'postgres',
      password: 'mysecretpassword'
    });
    this.backupDir = path.join(__dirname, '..', '..', 'backups');
  }

  async saveBackupInfo(connectedDatabaseName: string): Promise<number> {
    try {
      // Lire le contenu du dossier de backups
      const files = await fs.readdir(this.backupDir);
      
      // Trouver le fichier de dump le plus récent pour la base de données connectée
      const relevantDumps = files.filter(file => file.startsWith(`dump_${connectedDatabaseName}_`) && file.endsWith('.sql'));
      if (relevantDumps.length === 0) {
        throw new Error(`No dump file found for database ${connectedDatabaseName}`);
      }
      
      // Trier par date de modification (le plus récent en premier)
      const sortedDumps = await Promise.all(relevantDumps.map(async file => {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime };
      }));
      sortedDumps.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      const mostRecentDump = sortedDumps[0].file;
      const filePath = path.join(this.backupDir, mostRecentDump);

      // Insérer les informations du backup dans la table backup de SafeSpace
      const query = 'INSERT INTO backup (path, timestamp, action, database_name) VALUES ($1, $2, $3, $4) RETURNING id';
      const values = [filePath, 'save', connectedDatabaseName];

      const result = await this.pool.query(query, values);
      console.log(`Backup information saved with ID: ${result.rows[0].id}`);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving backup information:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}