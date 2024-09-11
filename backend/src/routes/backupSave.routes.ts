import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifySchema, FastifyTypeProviderDefault, RawServerDefault, RouteGenericInterface } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { BackupController } from '../controllers/backupSaveController';

const backupSaveRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const backupController = new BackupController();

  fastify.post<{ Body: { connectedDatabaseName: string } }>(
    '/save-backup-info',
    {
      schema: {
        body: {
          type: 'object',
          required: ['connectedDatabaseName'],
          properties: {
            connectedDatabaseName: { type: 'string' }
          }
        }
      }
    },
    async (request, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
      await backupController.saveBackupInfo(request, reply);
    }
  );

  // Fermer la connexion à la base de données lorsque le serveur s'arrête
  fastify.addHook('onClose', async (_instance: any) => {
    await backupController.closeService();
  });
};

export default backupSaveRoutes;