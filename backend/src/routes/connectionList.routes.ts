// routes/connection.routes.ts
import { FastifyInstance } from 'fastify';
import connectionController from '../controllers/connectionListController';

export default async function connectionRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/connectionsAll', connectionController.getConnectionAll);
}