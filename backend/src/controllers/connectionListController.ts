// controllers/connectionController.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import connectionService from '../services/connectionServiceList';

class ConnectionController {
  async getConnectionAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const connections = await connectionService.getConnectionsAll();
      reply.send({ connections });
    } catch (error) {
      console.error('Erreur dans le contrôleur:', error);
      reply.status(500).send({ 
        message: 'Erreur lors de la récupération des connexions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}

export default new ConnectionController();