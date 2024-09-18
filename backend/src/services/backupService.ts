import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import { DatabaseConfig } from '../services/types';
import cron from 'node-cron'; // Import de node-cron

export class BackupService {
  private backupDir: string;
  private pool: Pool;
  private dockerContainerName: string;

  constructor() {
    this.backupDir = path.join(__dirname, '..', '..', 'backup');
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'SafeBase',
      user: 'postgres',
      password: 'mysecretpassword',
    });
    this.dockerContainerName = 'postgres_container';
    this.checkBackupTable();
  }

  private async checkBackupTable() {
    try {
      const result = await this.pool.query("SELECT to_regclass('public.backup')");
      if (result.rows[0].to_regclass === null) {
        console.error("La table 'backup' n'existe pas !");
        // Vous pouvez ajouter ici du code pour créer la table si elle n'existe pas
      } else {
        console.log("La table 'backup' existe.");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la table 'backup':", error);
    }
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

  private getRelativePath(absolutePath: string): string {
    const projectRoot = path.resolve(__dirname, '..', '..');
    return path.relative(projectRoot, absolutePath);
  }

  private getAbsolutePath(relativePath: string): string {
    return path.resolve(__dirname, '..', '..', relativePath);
  }

  async testConnection() {
    try {
      const res = await this.pool.query('SELECT current_database()');
      console.log('Connected to database:', res.rows[0].current_database);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async createDump(dbConfig: DatabaseConfig): Promise<string> {
    console.log('Creating dump for database:', dbConfig.database);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpFileName = `dump_${dbConfig.database}_${timestamp}.sql`;
    const containerDumpPath = `/tmp/${dumpFileName}`;
    const hostDumpPath = path.join(this.backupDir, dumpFileName);

    await fs.mkdir(this.backupDir, { recursive: true });
    
    // Utiliser le format texte (-Fp) au lieu du format personnalisé (-Fc)
    const dumpCommand = `docker exec -e PGPASSWORD=${this.pool.options.password} ${this.dockerContainerName} pg_dump -h db -p 5432 -U ${this.pool.options.user} -d ${dbConfig.database} -Fp -f ${containerDumpPath}`;
    
    try {
      console.log('Executing dump command:', dumpCommand);
      const output = await this.execCommand(dumpCommand);
      console.log('Dump command output:', output);

      console.log('Copying dump file from container to host...');
      await this.execCommand(`docker cp ${this.dockerContainerName}:${containerDumpPath} ${hostDumpPath}`);

      console.log('Cleaning up temporary file in container...');
      await this.execCommand(`docker exec ${this.dockerContainerName} rm ${containerDumpPath}`);

      const fileContent = await fs.readFile(hostDumpPath, 'utf8');
      console.log('Dump preview:', fileContent.substring(0, 500));

      return hostDumpPath;
    } catch (error) {
      console.error('Error during dump creation:', error);
      throw error;
    }
  }

  async saveBackupInfo(backupPath: string, dbConfig: DatabaseConfig): Promise<number> {
    console.log('Saving backup info for:', dbConfig.database, 'Path:', backupPath);
    const relativePath = this.getRelativePath(backupPath);
    const query = 'INSERT INTO backup (path, timestamp, action, name_database) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [relativePath, new Date(), 'save', dbConfig.database];
  
    const result = await this.pool.query(query, values);
    const backupId = result.rows[0].id;
  
    console.log('Backup info saved. ID:', backupId);
    return backupId;
  }

  async getBackupHistory(): Promise<any[]> {
    const query = 'SELECT * FROM backup_history ORDER BY timestamp DESC';
    const result = await this.pool.query(query);
    console.log(`Retrieved ${result.rows.length} backup history records`);
    return result.rows;
  }

  async restoreDatabase(sourceDatabaseId: string, targetDatabaseName: string): Promise<void> {
    try {
      console.log(`Attempting to restore database. Source: ${sourceDatabaseId}, Target: ${targetDatabaseName}`);
      const query = 'SELECT path FROM backup WHERE name_database = $1 ORDER BY timestamp DESC LIMIT 1';
      const result = await this.pool.query(query, [sourceDatabaseId]);

      if (result.rows.length === 0) {
        throw new Error(`Aucun backup trouvé pour la base de données ${sourceDatabaseId}`);
      }

      const relativePath = result.rows[0].path;
      const backupPath = this.getAbsolutePath(relativePath);
      console.log(`Found backup path: ${backupPath}`);

      // Vérifiez si le fichier existe
      try {
        await fs.access(backupPath);
      } catch (error) {
        throw new Error(`Le fichier de sauvegarde n'existe pas : ${backupPath}`);
      }

      await this.createDatabaseIfNotExists(targetDatabaseName);

      // Copier le fichier dans le conteneur
      const containerPath = '/tmp/backup.sql';
      await this.execCommand(`docker cp "${backupPath}" ${this.dockerContainerName}:${containerPath}`);

      // Utiliser psql au lieu de pg_restore
      const restoreCommand = `docker exec -i ${this.dockerContainerName} psql -U ${this.pool.options.user} -d ${targetDatabaseName} -f ${containerPath}`;
      
      console.log('Executing restore command:', restoreCommand);
      const output = await this.execCommand(restoreCommand);
      console.log('Restore command output:', output);

      console.log(`Base de données restaurée avec succès dans ${targetDatabaseName}`);

      await this.saveRestoreInfo(relativePath, sourceDatabaseId, targetDatabaseName);
    } catch (error) {
      console.error('Erreur lors de la restauration de la base de données:', error);
      throw error;
    }
  }

  private async createDatabaseIfNotExists(databaseName: string): Promise<void> {
    try {
      const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
      const result = await this.pool.query(checkDbQuery, [databaseName]);

      if (result.rows.length === 0) {
        console.log(`La base de données ${databaseName} n'existe pas. Création en cours...`);
        const createDbCommand = `docker exec -i ${this.dockerContainerName} createdb -U ${this.pool.options.user} ${databaseName}`;
        await this.execCommand(createDbCommand);
        console.log(`Base de données ${databaseName} créée.`);
      } else {
        console.log(`La base de données ${databaseName} existe déjà.`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification/création de la base de données:', error);
      throw error;
    }
  }

  private async saveRestoreInfo(backupPath: string, sourceDatabaseId: string, targetDatabaseName: string): Promise<void> {
    console.log(`Saving restore info. Source: ${sourceDatabaseId}, Target: ${targetDatabaseName}, Path: ${backupPath}`);
    const query = 'INSERT INTO backup_history (path, timestamp, action, database_name, target_database) VALUES ($1, $2, $3, $4, $5)';
    const values = [backupPath, new Date(), 'restore', sourceDatabaseId, targetDatabaseName];
    await this.pool.query(query, values);
    console.log('Restore info saved successfully');
  }

  async listBackups(databaseName?: string): Promise<any[]> {
    let query = 'SELECT * FROM backup';
    let params = [];

    if (databaseName) {
      query += ' WHERE name_database = $1';
      params.push(databaseName);
    }

    query += ' ORDER BY timestamp DESC';

    console.log('Executing query:', query, 'with params:', params);
    const result = await this.pool.query(query, params);
    console.log(`Retrieved ${result.rows.length} backups${databaseName ? ` for database ${databaseName}` : ''}`);
    console.log('Query result:', result.rows);
    return result.rows;
  }

  async listAllBackups(): Promise<any[]> {
    const query = 'SELECT * FROM backup ORDER BY timestamp DESC';
    const result = await this.pool.query(query);
    console.log(`Retrieved ${result.rows.length} backups`);
    return result.rows;
  }

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