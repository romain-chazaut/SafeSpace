import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { BackupController } from '../controllers/backupDumpController';

const backupRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const backupController = new BackupController();

  fastify.post<{ Body: { database: string } }>(
    '/create-dump',
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
    async (request, reply) => {
      await backupController.createDump(request, reply);
    }
  );
};

export default backupRoutes;