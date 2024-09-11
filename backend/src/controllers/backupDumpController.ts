import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from '../services/backupService';

interface CreateDumpBody {
  database: string;
}

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  async createDump(request: FastifyRequest<{ Body: CreateDumpBody }>, reply: FastifyReply) {
    const { database } = request.body;

    if (!database) {
      reply.status(400).send({ success: false, error: 'Database name is required' });
      return;
    }

    try {
      const dumpPath = await this.backupService.createDump({ database });
      reply.send({ success: true, path: dumpPath });
    } catch (error) {
      console.error('Error in createDump controller:', error);
      reply.status(500).send({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}