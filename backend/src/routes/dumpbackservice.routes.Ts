import { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, FastifyTypeProviderDefault, RawServerDefault, RouteGenericInterface } from 'fastify';
import { ResolveFastifyRequestType } from 'fastify/types/type-provider';
import { IncomingMessage, ServerResponse } from 'http';
import { BackupController } from '../controllers/dumpbackupController';
import { DatabaseConfig } from '../services/types';


export default async function backupRoutesSave(fastify: FastifyInstance) {
  const backupController = new BackupController();

  // Route pour créer un backup
  fastify.post<{ Body: DatabaseConfig }>('/backup/create', {
    schema: {
      body: {
        type: 'object',
        required: ['database'],
        properties: {
          database: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: DatabaseConfig; }, RawServerDefault, IncomingMessage, FastifySchema, FastifyTypeProviderDefault, unknown, FastifyBaseLogger, ResolveFastifyRequestType<FastifyTypeProviderDefault, FastifySchema, { Body: DatabaseConfig; }>>, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
    await backupController.createBackup(request, reply);
  });

  // Route pour obtenir l'historique des backups
  fastify.get('/backup/history', async (request: FastifyRequest<RouteGenericInterface, RawServerDefault, IncomingMessage, FastifySchema, FastifyTypeProviderDefault, unknown, FastifyBaseLogger, ResolveFastifyRequestType<FastifyTypeProviderDefault, FastifySchema, RouteGenericInterface>>, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
    await backupController.getBackupHistory(request, reply);
  });

  fastify.post<{
    Body: { sourceDatabaseId: string; targetDatabaseName: string }
  }>('/backups/restore', async (request: FastifyRequest<{ Body: { sourceDatabaseId: string; targetDatabaseName: string; }; }, RawServerDefault, IncomingMessage, FastifySchema, FastifyTypeProviderDefault, unknown, FastifyBaseLogger, ResolveFastifyRequestType<FastifyTypeProviderDefault, FastifySchema, { Body: { sourceDatabaseId: string; targetDatabaseName: string; }; }>>, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
    return backupController.restoreDatabase(request, reply);
  });
  fastify.addHook('onClose', async () => {
    backupController.closeService();
  });
}
