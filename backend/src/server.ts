import Fastify from 'fastify';
import { databaseRoutes } from './routes/database.routes';  // Assurez-vous que le chemin est correct

const fastify = Fastify({ logger: true });

// Enregistrez les routes
fastify.register(databaseRoutes);

// Démarrez le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
