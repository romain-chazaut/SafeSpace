import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { DatabaseService } from './services/database.service';
import { BackupService } from './services/backupService';
import { CronService } from './services/CronService';
import { DatabaseController } from './controllers/database.controller';
import { BackupController } from './controllers/backupController';
import { CronController } from './controllers/CronController';
import { DatabaseConfig } from './services/types';
import ConnectionService from './services/connectionServiceList';


// Charger les variables d'environnement
dotenv.config();

// Initialisation de l'instance Fastify avec le logger activé
const fastify: FastifyInstance = Fastify({
  logger: true
});

// Configuration du middleware CORS
fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Initialisation des services
const databaseService = new DatabaseService();
const backupService = new BackupService(databaseService);
const cronService = new CronService();
const connectionService = new ConnectionService(databaseService);


// Initialisation des contrôleurs
const databaseController = new DatabaseController(databaseService);
const backupController = new BackupController(backupService);
const cronController = new CronController(databaseService);

// Routes pour la gestion de la connexion à la base de données
fastify.post('/connect', async (request, reply) => {
  return databaseController.connect(request as FastifyRequest<{ Body: DatabaseConfig }>, reply);
});

fastify.post('/disconnect', async (request, reply) => {
  return databaseController.disconnect(request, reply);
});

// Routes pour les opérations de sauvegarde
fastify.post('/backup', async (request, reply) => {
  return backupController.createBackup(request as FastifyRequest<{ Body: DatabaseConfig }>, reply);
});

fastify.get('/backups', async (request, reply) => {
  return backupController.listBackups(request as FastifyRequest<{ Querystring: { databaseName?: string } }>, reply);
});

fastify.post('/restore/:sourceBackupId', async (request, reply) => {
  return backupController.restoreDatabase(request as FastifyRequest<{ Params: { sourceBackupId: string }; Body: { targetDatabaseName: string } }>, reply);
});

fastify.get('/backup/history', {
  schema: {
    querystring: {
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    }
  }
}, async (request, reply) => {
  return backupController.getBackupHistory(request as FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply);
});

// Route pour lister les tâches cron
fastify.get('/crons', async (request, reply) => {
  return cronController.listCrons(request, reply);
});

// Route pour ajouter une nouvelle tâche cron
fastify.post<{
  Body: {
    jobName: string;
    schedule: string;
    dbConfig: DatabaseConfig;
    description?: string;
  }
}>('/crons', async (request, reply) => {
  return cronController.startCron(request, reply);
});

  // Route pour supprimer une tâche cron
  fastify.delete<{
    Params: {
      jobName: string;
    }
  }>('/crons/:jobName', async (request, reply) => {
    return cronController.stopCron(request, reply);
  });
  
  fastify.get('/connections', async (request, reply) => {
    console.log('Received request for /connections');
    try {
      const connections = await connectionService.getConnectionsAll();
      console.log('Retrieved connections:', connections);
      reply.send(connections);
    } catch (error) {
      console.error('Failed to retrieve connections:', error);
      reply.status(500).send({ error: 'Failed to retrieve connections', details: (error as Error).message });
    }
  });

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
