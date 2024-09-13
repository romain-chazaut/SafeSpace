import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
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
    async (request: FastifyRequest<{ Body: { connectedDatabaseName: string } }>, reply: FastifyReply) => {
      await backupController.saveBackupInfo(request, reply);
    }
  );

  // Fermer la connexion à la base de données lorsque le serveur s'arrête
  fastify.addHook('onClose', async () => {
    await backupController.closeService();
  });
};

export default backupSaveRoutes;
