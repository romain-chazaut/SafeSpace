import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from '../services/dumpbackservice';
import { DatabaseConfig } from '../services/types';

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  async createBackup(request: FastifyRequest<{ Body: DatabaseConfig }>, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.backupService.createDumpAndSaveInfo(request.body);
      reply.send({ 
        success: true, 
        message: 'Backup created and information saved successfully', 
        data: result 
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