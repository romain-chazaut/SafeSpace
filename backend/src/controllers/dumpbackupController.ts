import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from '../services/backupService';
import { DatabaseConfig } from '../services/types';

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  // Méthode pour récupérer l'historique des backups
  async getBackupHistory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const history = await this.backupService.getBackupHistory();
      reply.send({ success: true, history });
    } catch (error) {
      if (request && request.log) {
        request.log.error(error);
      }
      
      if (reply && typeof reply.code === 'function') {
        reply.code(500).send({ 
          success: false, 
          message: 'Failed to retrieve backup history', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      } else {
        console.error('Error retrieving backup history:', error);
        // En dernier recours, afficher une erreur si `reply` n'est pas disponible
      }
    }
  }

  // Méthode pour créer un backup
  async createBackup(request: FastifyRequest<{ Body: DatabaseConfig }>, reply: FastifyReply): Promise<void> {
    try {
      const dumpPath = await this.backupService.createDump(request.body);
      const backupId = await this.backupService.saveBackupInfo(dumpPath, request.body);
      reply.send({ success: true, message: 'Backup created and information saved successfully', backupId });
    } catch (error) {
      if (request && request.log) {
        request.log.error(error);
      }

      if (reply && typeof reply.code === 'function') {
        reply.code(500).send({ 
          success: false, 
          message: 'Backup creation or information saving failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      } else {
        console.error('Error creating backup:', error);
      }
    }
  }

  // Méthode pour fermer les services
  async closeService(): Promise<void> {
    await this.backupService.close();
  }
}
