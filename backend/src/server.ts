import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import connectionRoutes from './routes/database.routes';
import backupRoutes from './routes/backup.routes';
import connexion from './routes/connexion.routes';
import { createPool, testConnection } from './db';
import backupRoutesSave from './routes/dumpbackservice.routes';
import cronRoutes from './routes/cron.routes'; // Importer les routes cron
import { BackupService } from './services/backupService'; // Importer le service de sauvegarde
import { CronService } from './services/CronService'; // Importer le service des tâches cron
import connexionAll from './routes/connectionList.routes';

const fastify: FastifyInstance = Fastify({
  logger: true
});

// Décoration de l'instance Fastify avec la connexion à la base de données
fastify.decorate('db', createPool());

// Configuration du middleware CORS
fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Enregistrement des routes
fastify.register(connectionRoutes);
fastify.register(backupRoutes);
fastify.register(connexion);

fastify.register(backupRoutesSave);
fastify.register(cronRoutes);
fastify.register(connexionAll); // Enregistrement des routes cron
 // Enregistrement des routes cron

// Instancier le service de sauvegarde et de gestion des crons
const backupService = new BackupService();
const cronService = new CronService();



// Démarrage du serveur Fastify
const start = async () => {
  try {
    const dbStatus = await testConnection(fastify.db);
    console.log('Database connection status:', dbStatus);

    if (dbStatus.success) {
      await fastify.listen({ port: 3000, host: '0.0.0.0' });
      console.log(`Server is running on http://localhost:3000`);
    } else {
      throw new Error('Failed to connect to the database');
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
