import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from '../services/backupService';
import { DatabaseConfig } from '../services/types';

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  async createBackup(request: FastifyRequest<{ Body: DatabaseConfig }>, reply: FastifyReply): Promise<void> {
    try {
      const dumpPath = await this.backupService.createDump(request.body);
      const backupId = await this.backupService.saveBackupInfo(dumpPath, request.body);
      
      reply.send({ 
        success: true, 
        message: 'Backup created and information saved successfully', 
        backupId 
      });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ 
        success: false, 
        message: 'Backup creation or information saving failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  async closeService(): Promise<void> {
    await this.backupService.close();
  }
}
