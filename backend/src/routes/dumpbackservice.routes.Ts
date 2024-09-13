import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BackupController } from '../controllers/dumpbackupController';
import { DatabaseConfig } from '../services/types';

export default async function backupRoutesSave(fastify: FastifyInstance) {
  const backupController = new BackupController();

  fastify.post<{ Body: DatabaseConfig }>(
    '/backup/create',
    {
      schema: {
        body: {
          type: 'object',
          required: ['database'],
          properties: {
            database: { type: 'string' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: DatabaseConfig }>, reply: FastifyReply) => {
      await backupController.createBackup(request, reply);
    }
  );

  fastify.addHook('onClose', async () => {
    await backupController.closeService();
  });
}
