import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifySchema, FastifyTypeProviderDefault, RawServerDefault, RouteGenericInterface } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { BackupController } from '../controllers/backupDumpController';

const backupRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const backupController = new BackupController();

  // Route pour créer un dump
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
    async (request, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
      await backupController.createDump(request, reply);
    }
  );
};

export default backupRoutes;
