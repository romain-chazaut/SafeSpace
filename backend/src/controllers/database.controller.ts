import { FastifyRequest, FastifyReply } from 'fastify';
import { DatabaseService } from '../services/database.service';
import { PoolConfig } from 'pg';

export class DatabaseController {
  constructor(private databaseService: DatabaseService) {}

  async connect(request: FastifyRequest<{ Body: PoolConfig }>, reply: FastifyReply) {
    try {
      await this.databaseService.connect(request.body);
      reply.code(200).send({ success: true, message: 'Connected to database' });
    } catch (error) {
      reply.code(500).send({ success: false, message: (error as Error).message });
    }
  }

  async disconnect(request: FastifyRequest, reply: FastifyReply) {
    try {
      await this.databaseService.disconnect();
      reply.code(200).send({ success: true, message: 'Disconnected from database' });
    } catch (error) {
      reply.code(500).send({ success: false, message: (error as Error).message });
    }
  }
}