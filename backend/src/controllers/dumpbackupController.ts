import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from '../services/backupService';
import { DatabaseConfig } from '../services/types';

export class BackupController {
  closeService() {
    throw new Error('Method not implemented.');
  }
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  async createBackup(request: FastifyRequest<{ Body: DatabaseConfig }>, reply: FastifyReply) {
    try {
      const dbConfig = request.body;
      console.log('Creating backup for database:', dbConfig.database);

      const dumpPath = await this.backupService.createDump(dbConfig);
      const backupId = await this.backupService.saveBackupInfo(dumpPath, dbConfig);

      return reply.code(200).send({ success: true, message: 'Backup created successfully', backupId });
    } catch (error) {
      console.error('Error in createBackup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ success: false, message: 'Backup creation failed', error: errorMessage });
    }
  }

  async getBackupHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const history = await this.backupService.getBackupHistory();
      return reply.code(200).send({ success: true, history });
    } catch (error) {
      console.error('Error in getBackupHistory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ success: false, message: 'Failed to retrieve backup history', error: errorMessage });
    }
  }

  async restoreDatabase(request: FastifyRequest<{ Body: { sourceDatabaseId: string; targetDatabaseName: string } }>, reply: FastifyReply) {
    try {
      const { sourceDatabaseId, targetDatabaseName } = request.body;
      console.log(`Attempting to restore database. Source: ${sourceDatabaseId}, Target: ${targetDatabaseName}`);

      // Vérifier si des sauvegardes existent pour la base de données source
      const backups = await this.backupService.listBackups(sourceDatabaseId);
      if (backups.length === 0) {
        return reply.code(404).send({ success: false, message: `No backups found for database ${sourceDatabaseId}` });
      }

      await this.backupService.restoreDatabase(sourceDatabaseId, targetDatabaseName);
      return reply.code(200).send({ success: true, message: 'Database restored successfully' });
    } catch (error) {
      console.error('Error in restoreDatabase:', error);
      if (error instanceof Error && error.message.includes('Aucun backup trouvé')) {
        return reply.code(404).send({ success: false, message: error.message });
      }
      return reply.code(500).send({ success: false, message: 'Database restoration failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async listBackups(request: FastifyRequest<{ Querystring: { databaseName?: string } }>, reply: FastifyReply) {
    try {
      const { databaseName } = request.query;
      const backups = await this.backupService.listBackups(databaseName);
      return reply.code(200).send({ success: true, backups });
    } catch (error) {
      console.error('Error in listBackups:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ success: false, message: 'Failed to list backups', error: errorMessage });
    }
  }
}