import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
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

// Initialisation des services
const databaseService = new DatabaseService();
const backupService = new BackupService(databaseService);
const connectionService = new ConnectionService(databaseService);

// Initialisation des contrôleurs
const databaseController = new DatabaseController(databaseService);
const backupController = new BackupController(backupService);

let io: SocketIOServer;
let cronService: CronService;
let cronController: CronController;

// Enregistrement du plugin CORS
fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Fonction pour configurer les routes
function setupRoutes() {
  fastify.get('/', async () => ({ message: 'Hello from SafeSpace backend!' }));

  fastify.get('/hello', async () => {
    console.log("Route /hello appelée");
    return { hello: 'world' };
  });

  fastify.get('/test', async () => ({ message: 'Test route works!' }));

  fastify.post<{ Body: DatabaseConfig }>('/connect', async (request, reply) => 
    databaseController.connect(request, reply)
  );

  fastify.post('/disconnect', async (request, reply) => 
    databaseController.disconnect(request, reply)
  );

  fastify.post<{ Body: DatabaseConfig }>('/backup', async (request, reply) => 
    backupController.createBackup(request, reply)
  );

  fastify.get<{ Querystring: { databaseName?: string } }>('/backups', async (request, reply) => 
    backupController.listBackups(request, reply)
  );

  fastify.post<{ Params: { sourceBackupId: string }; Body: { targetDatabaseName: string } }>(
    '/restore/:sourceBackupId',
    async (request, reply) => backupController.restoreDatabase(request, reply)
  );

  fastify.get<{ Querystring: { page?: string; limit?: string } }>(
    '/backup/history',
    {
      schema: {
        querystring: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 }
        }
      }
    },
    async (request, reply) => backupController.getBackupHistory(request, reply)
  );

  fastify.get('/crons', async (request, reply) => 
    cronController.listCrons(request, reply)
  );
  
  fastify.get('/docker', async (_, reply) => reply.send("docker"));

  fastify.post<{
    Body: {
      jobName: string;
      schedule: string;
      dbConfig: DatabaseConfig;
      description?: string;
    }
  }>('/crons', async (request, reply) => 
    cronController.startCron(request, reply)
  );

  fastify.delete<{
    Params: {
      jobName: string;
    }
  }>('/crons/:jobName', async (request, reply) => 
    cronController.stopCron(request, reply)
  );

  fastify.get('/connections', async (_, reply) => {
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
  fastify.get('/api/databases', async (request, reply) => {
    const databases = await backupService.listDatabases();
    return { databases };
  });

  fastify.post('/api/databases', async (request, reply) => {
    const { databaseName } = request.body as { databaseName: string };
    await backupService.createDatabase(databaseName);
    return { success: true, message: `Base de données ${databaseName} créée avec succès.` };
  });

  fastify.get('/api/current-database', async (request, reply) => {
    const currentDatabase = await backupService.getCurrentDatabase();
    return { currentDatabase };
  });

  fastify.post('/api/set-current-database', async (request, reply) => {
    const { databaseName } = request.body as { databaseName: string };
    await backupService.setCurrentDatabase(databaseName);
    return { success: true, message: `Base de données courante changée pour ${databaseName}.` };
  });

  fastify.get('/api/database-contents', async (request, reply) => {
    const { databaseName } = request.query as { databaseName: string };
    const contents = await backupService.getDatabaseContents(databaseName);
    return contents;
  });
}

// Fonction pour démarrer le serveur
const start = async () => {
  try {
    // Configuration des routes avant de démarrer le serveur
    setupRoutes();

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Le serveur fonctionne sur http://localhost:3000 à l'intérieur du conteneur`);
    console.log(`Le serveur est accessible sur http://localhost:3001 depuis l'hôte`);

    // Initialisation de Socket.IO
    io = new SocketIOServer(fastify.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialisation du service Cron et du contrôleur Cron
    cronService = new CronService(io);
    cronController = new CronController(databaseService, cronService, backupService);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();