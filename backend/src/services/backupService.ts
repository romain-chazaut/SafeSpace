import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { DatabaseConfig } from '../services/types';
import cron from 'node-cron';
import { DatabaseService } from './database.service';

export class BackupService {
  private backupDir: string;
  private dockerContainerName: string;

  constructor(private databaseService: DatabaseService) {
    this.backupDir = '../backend/backup';
    console.log('Backup directory:', this.backupDir);
    this.dockerContainerName = 'postgres_container';
  }

  async initialize() {
    await this.checkBackupTables();
  }

  private async checkBackupTables() {
    try {
      await this.createBackupTable();
      await this.createBackupHistoryTable();
    } catch (error) {
      console.error("Erreur lors de la vérification/création des tables:", error);
    }
  }

  private async createBackupTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS backup (
        id SERIAL PRIMARY KEY,
        path TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL,
        name_database TEXT NOT NULL
      )
    `;
    await this.databaseService.getPool().query(createTableQuery);
    console.log("Table 'backup' vérifiée/créée avec succès.");
  }

  private async createBackupHistoryTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS backup_history (
        id SERIAL PRIMARY KEY,
        backup_id INTEGER REFERENCES backup(id),
        path TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL,
        database_name TEXT NOT NULL,
        target_database TEXT
      )
    `;
    await this.databaseService.getPool().query(createTableQuery);
    console.log("Table 'backup_history' vérifiée/créée avec succès.");
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
    console.log('Creating dump for database:', dbConfig.database);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpFileName = `dump_${dbConfig.database}_${timestamp}.sql`;
    const containerDumpPath = `/tmp/${dumpFileName}`;
    const relativeDumpPath = path.join(this.backupDir, dumpFileName);

    await fs.mkdir(this.backupDir, { recursive: true });

    const pool = this.databaseService.getPool();
    const dumpCommand = `docker exec -e PGPASSWORD=${pool.options.password} ${this.dockerContainerName} pg_dump -h db -p 5432 -U ${pool.options.user} -d ${dbConfig.database} -Fp -f ${containerDumpPath}`;

    try {
      console.log('Executing dump command:', dumpCommand);
      const output = await this.execCommand(dumpCommand);
      console.log('Dump command output:', output);

      console.log('Copying dump file from container to host...');
      await this.execCommand(`docker cp ${this.dockerContainerName}:${containerDumpPath} ${relativeDumpPath}`);

      console.log('Cleaning up temporary file in container...');
      await this.execCommand(`docker exec ${this.dockerContainerName} rm ${containerDumpPath}`);

      console.log('Relative path for dump:', relativeDumpPath);
      
      // Insert into backup and backup_history tables
      const backupId = await this.saveBackupInfo(relativeDumpPath, dbConfig);
      await this.saveBackupHistoryInfo(backupId, relativeDumpPath, dbConfig.database);

      return relativeDumpPath;
    } catch (error) {
      console.error('Error during dump creation:', error);
      throw error;
    }
  }

  async saveBackupInfo(backupPath: string, dbConfig: DatabaseConfig): Promise<number> {
    const query = 'INSERT INTO backup (path, timestamp, action, name_database) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [backupPath, new Date(), 'save', dbConfig.database];
    const result = await this.databaseService.getPool().query(query, values);
    console.log('Backup info saved in backup table');
    return result.rows[0].id;
  }

  async saveBackupHistoryInfo(backupId: number, backupPath: string, databaseName: string): Promise<void> {
    const query = 'INSERT INTO backup_history (backup_id, path, timestamp, action, database_name) VALUES ($1, $2, $3, $4, $5)';
    const values = [backupId, backupPath, new Date(), 'save', databaseName];
    await this.databaseService.getPool().query(query, values);
    console.log('Backup info saved in backup_history table');
  }

  async getBackupHistory(page: number = 1, limit: number = 10): Promise<{ rows: any[], totalCount: number }> {
    const offset = (page - 1) * limit;
    const query = 'SELECT * FROM backup_history ORDER BY timestamp DESC LIMIT $1 OFFSET $2';
    const countQuery = 'SELECT COUNT(*) FROM backup_history';
    
    const [result, countResult] = await Promise.all([
      this.databaseService.getPool().query(query, [limit, offset]),
      this.databaseService.getPool().query(countQuery)
    ]);
  
    return {
      rows: result.rows,
      totalCount: parseInt(countResult.rows[0].count)
    };
  }
  async restoreDatabase(sourceBackupId: number, targetDatabaseName: string): Promise<void> {
    try {
      console.log(`Attempting to restore database. Source Backup ID: ${sourceBackupId}, Target: ${targetDatabaseName}`);
      const query = 'SELECT path, name_database FROM backup WHERE id = $1';
      const result = await this.databaseService.getPool().query<{ path: string; name_database: string }>(query, [sourceBackupId]);

      if (result.rows.length === 0) {
        throw new Error(`Aucun backup trouvé avec l'ID ${sourceBackupId}`);
      }

      const { path: relativePath, name_database: sourceDatabaseName } = result.rows[0];
      const backupPath = path.resolve(__dirname, '..', '..', relativePath);

      console.log(`Found backup path: ${backupPath} for database: ${sourceDatabaseName}`);

      try {
        await fs.access(backupPath);
      } catch (error) {
        throw new Error(`Le fichier de sauvegarde n'existe pas : ${backupPath}`);
      }

      await this.createDatabaseIfNotExists(targetDatabaseName);

      const containerPath = '/tmp/backup.sql';
      await this.execCommand(`docker cp "${backupPath}" ${this.dockerContainerName}:${containerPath}`);

      const pool = this.databaseService.getPool();
      const restoreCommand = `docker exec -i ${this.dockerContainerName} psql -U ${pool.options.user} -d ${targetDatabaseName} -f ${containerPath}`;
      console.log('Executing restore command:', restoreCommand);
      const output = await this.execCommand(restoreCommand);
      console.log('Restore command output:', output);

      console.log(`Base de données restaurée avec succès dans ${targetDatabaseName}`);
      await this.saveRestoreInfo(sourceBackupId, relativePath, sourceDatabaseName, targetDatabaseName);
    } catch (error) {
      console.error('Erreur lors de la restauration de la base de données:', error);
      throw error;
    }
  }

  private async createDatabaseIfNotExists(databaseName: string): Promise<void> {
    try {
      const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
      const result = await this.databaseService.getPool().query(checkDbQuery, [databaseName]);
      if (result.rows.length === 0) {
        console.log(`La base de données ${databaseName} n'existe pas. Création en cours...`);
        const pool = this.databaseService.getPool();
        const createDbCommand = `docker exec -i ${this.dockerContainerName} createdb -U ${pool.options.user} ${databaseName}`;
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

  private async saveRestoreInfo(backupId: number, backupPath: string, sourceDatabaseName: string, targetDatabaseName: string): Promise<void> {
    console.log(`Enregistrement des informations de restauration. ID de sauvegarde : ${backupId}, Source : ${sourceDatabaseName}, Cible : ${targetDatabaseName}`);
    const backupQuery = 'INSERT INTO backup (path, timestamp, action, name_database) VALUES ($1, $2, $3, $4) RETURNING id';
    const backupValues = [backupPath, new Date(), 'restore', targetDatabaseName];
    
    const historyQuery = 'INSERT INTO backup_history (backup_id, path, timestamp, action, database_name, target_database) VALUES ($1, $2, $3, $4, $5, $6)';
    
    try {
      const backupResult = await this.databaseService.getPool().query(backupQuery, backupValues);
      const newBackupId = backupResult.rows[0].id;
      
      const historyValues = [newBackupId, backupPath, new Date(), 'restore', sourceDatabaseName, targetDatabaseName];
      await this.databaseService.getPool().query(historyQuery, historyValues);
      
      console.log('Informations de restauration enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des informations de restauration:', error);
      throw error;
    }
  }

  async listBackups(databaseName?: string): Promise<any[]> {
    let query = 'SELECT * FROM backup';
    let params = [];
    if (databaseName) {
      query += ' WHERE name_database = $1';
      params.push(databaseName);
    }
    query += ' ORDER BY timestamp DESC';
    const result = await this.databaseService.getPool().query(query, params);
    return result.rows;
  }

  startCronJob(dbConfig: DatabaseConfig, schedule: string = '0 0 * * *') {
    cron.schedule(schedule, async () => {
      console.log('Exécution automatique de la sauvegarde selon le cron :', schedule);
      try {
        await this.createDump(dbConfig);
        console.log('Sauvegarde automatique réussie');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique :', error);
      }
    });
    console.log('Tâche cron planifiée pour :', schedule);
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
      const tablesResult = await this.databaseService.getPool().query(tablesQuery);
      const tables = tablesResult.rows.map(row => row.table_name);

      // Get contents of each table
      const contents: { [key: string]: any[] } = {};
      for (const table of tables) {
        const contentQuery = `SELECT * FROM "${table}" LIMIT 100;`;
        const contentResult = await this.databaseService.getPool().query(contentQuery);
        contents[table] = contentResult.rows;
      }

      return { tables, contents };
    } catch (error) {
      console.error('Error fetching database contents:', error);
      throw error;
    }
  }
  
}