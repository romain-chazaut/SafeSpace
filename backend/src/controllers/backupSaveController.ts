import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupServiceSave } from '../services/backupSaveService';

interface SaveBackupBody {
  connectedDatabaseName: string;
}

export class BackupController {
  private backupService: BackupServiceSave;

  constructor() {
    this.backupService = new BackupServiceSave();
  }

  async saveBackupInfo(request: FastifyRequest<{ Body: SaveBackupBody }>, reply: FastifyReply) {
    const { connectedDatabaseName } = request.body;

    if (!connectedDatabaseName) {
      reply.status(400).send({ success: false, error: 'Connected database name is required' });
      return;
    }

    try {
      const backupId = await this.backupService.saveBackupInfo(connectedDatabaseName);
      reply.send({ success: true, backupId });
    } catch (error) {
      console.error('Error in saveBackupInfo controller:', error);
      reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async closeService() {
    await this.backupService.close();
  }
}