import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from '../services/backupService';
import { DatabaseConfig } from '../services/types';

export class BackupController {
  constructor(private backupService: BackupService) {}

  async createBackup(request: FastifyRequest<{ Body: DatabaseConfig }>, reply: FastifyReply) {
    try {
      const dbConfig = request.body;
      console.log('Creating backup for database:', dbConfig.database);

      const dumpPath = await this.backupService.createDump(dbConfig);
      // Remarque : saveBackupInfo est maintenant appelé à l'intérieur de createDump
      
      return reply.code(200).send({ 
        success: true, 
        message: 'Backup created successfully', 
        backupPath: dumpPath 
      });
    } catch (error) {
      console.error('Error in createBackup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ 
        success: false, 
        message: 'Backup creation failed', 
        error: errorMessage 
      });
    }
  }

  async getBackupHistory(request: FastifyRequest<{Querystring: {page?: string, limit?: string}}>, reply: FastifyReply) {
    try {
      const page = parseInt(request.query.page || '1');
      const limit = parseInt(request.query.limit || '10');
  
      const { rows: history, totalCount } = await this.backupService.getBackupHistory(page, limit);
      
      const totalPages = Math.ceil(totalCount / limit);
      
      return reply.code(200).send({ 
        success: true, 
        history,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      console.error('Error in getBackupHistory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(500).send({ 
        success: false, 
        message: 'Failed to retrieve backup history', 
        error: errorMessage 
      });
    }
  }

  async restoreDatabase(
    request: FastifyRequest<{
      Params: { sourceBackupId: string };
      Body: { targetDatabaseName: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const sourceBackupId = parseInt(request.params.sourceBackupId, 10);
      const { targetDatabaseName } = request.body;

      console.log(`Attempting to restore database. Source Backup ID: ${sourceBackupId}, Target: ${targetDatabaseName}`);

      await this.backupService.restoreDatabase(sourceBackupId, targetDatabaseName);
      
      return reply.code(200).send({
        success: true,
        message: 'Database restored successfully'
      });
    } catch (error) {
      console.error('Error in restoreDatabase:', error);
      if (error instanceof Error && error.message.includes('Aucun backup trouvé')) {
        return reply.code(404).send({
          success: false,
          message: error.message
        });
      }
      return reply.code(500).send({
        success: false,
        message: 'Database restoration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      return reply.code(500).send({ 
        success: false, 
        message: 'Failed to list backups', 
        error: errorMessage 
      });
    }
  }

  
}