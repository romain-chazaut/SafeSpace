import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { DatabaseService } from './services/database.service';
import { BackupService } from './services/backupService';
import { CronService } from './services/CronService';
import { DatabaseController } from './controllers/database.controller';
import { BackupController } from './controllers/backupController';
import { CronController } from './controllers/CronController';
import { DatabaseConfig } from './services/types';
import ConnectionService from './services/connectionServiceList';

const fastify: FastifyInstance = Fastify({
  logger: true
});

// Enregistrement du plugin CORS
fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Initialisation des services
const databaseService = new DatabaseService();
const backupService = new BackupService(databaseService);
const connectionService = new ConnectionService(databaseService);

let io: SocketIOServer;
let cronService: CronService;
let databaseController: DatabaseController;
let backupController: BackupController;
let cronController: CronController;

// Fonction pour configurer les routes
function setupRoutes() {
  fastify.post<{ Body: DatabaseConfig }>('/connect', async (request, reply) => {
    return databaseController.connect(request, reply);
  });

  fastify.post('/disconnect', async (request, reply) => {
    return databaseController.disconnect(request, reply);
  });

  fastify.post<{ Body: DatabaseConfig }>('/backup', async (request, reply) => {
    return backupController.createBackup(request, reply);
  });

  fastify.get<{ Querystring: { databaseName?: string } }>('/backups', async (request, reply) => {
    return backupController.listBackups(request, reply);
  });

  fastify.post<{ Params: { sourceBackupId: string }; Body: { targetDatabaseName: string } }>('/restore/:sourceBackupId', async (request, reply) => {
    return backupController.restoreDatabase(request, reply);
  });

  fastify.get<{ Querystring: { page?: string; limit?: string } }>('/backup/history', {
    schema: {
      querystring: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100 }
      }
    }
  }, async (request, reply) => {
    return backupController.getBackupHistory(request, reply);
  });

  fastify.get('/crons', async (request, reply) => {
    return cronController.listCrons(request, reply);
  });

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

  fastify.delete<{
    Params: {
      jobName: string;
    }
  }>('/crons/:jobName', async (request, reply) => {
    return cronController.stopCron(request, reply);
  });

  fastify.get('/connections', async (request, reply) => {
    console.log('Requête reçue pour /connections');
    try {
      const connections = await connectionService.getConnectionsAll();
      console.log('Connexions récupérées:', connections);
      reply.send(connections);
    } catch (error) {
      console.error('Échec de la récupération des connexions:', error);
      reply.status(500).send({ error: 'Échec de la récupération des connexions', details: (error as Error).message });
    }
  });
}

// Fonction pour démarrer le serveur
const start = async () => {
  try {
    // Configuration des routes avant de démarrer le serveur
    setupRoutes();

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Le serveur fonctionne sur http://localhost:3000`);

    // Initialisation de Socket.IO
    io = new SocketIOServer(fastify.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialisation des services qui dépendent de Socket.IO
    cronService = new CronService(io);

    // Initialisation des contrôleurs
    databaseController = new DatabaseController(databaseService);
    backupController = new BackupController(backupService);
    cronController = new CronController(databaseService, cronService, backupService);

    // Gestionnaire de connexion Socket.IO
    io.on('connection', (socket) => {
      console.log('Un client Socket.IO s\'est connecté');

      socket.on('disconnect', () => {
        console.log('Un client Socket.IO s\'est déconnecté');
      });
    });

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
