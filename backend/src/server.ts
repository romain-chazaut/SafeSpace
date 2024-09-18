import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import connectionRoutes from './routes/database.routes';
import backupRoutes from './routes/backup.routes';
import connexion from './routes/connexion.routes';
import { createPool, testConnection } from './db';
// import backupSaveRoutes from './routes/backupSave.routes';
import backupRoutesSave from './routes/dumpbackservice.routes';


const fastify: FastifyInstance = Fastify({
  logger: true
});

fastify.decorate('db', createPool());

fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

fastify.register(connectionRoutes);
fastify.register(backupRoutes);
fastify.register(connexion)
fastify.register(backupRoutesSave);



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