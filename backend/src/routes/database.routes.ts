import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseService } from '../database/services/database.service';

interface AddConnectionRequest extends FastifyRequest {
  Body: {
    name: string;
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

interface DeleteConnectionRequest extends FastifyRequest {
  Params: {
    id: string;
  };
}

export async function databaseRoutes(fastify: FastifyInstance) {
  const service = new DatabaseService();

  fastify.post('/databases', async (request: AddConnectionRequest, reply: FastifyReply) => {
    try {
      const connection = await service.addConnection(request.body);
      reply.send(connection);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to add connection' });
    }
  });

  fastify.delete('/databases/:id', async (request: DeleteConnectionRequest, reply: FastifyReply) => {
    const id = request.params.id;
    if (!id) {
      return reply.status(400).send({ error: 'ID is required' });
    }
    try {
      await service.removeConnection(Number(id));
      reply.send({ success: true });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete connection' });
    }
  });

  fastify.get('/databases', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const connections = await service.getConnections();
      reply.send(connections);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch connections' });
    }
  });
}
