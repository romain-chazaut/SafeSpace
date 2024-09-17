import { FastifyRequest, FastifyReply } from 'fastify'
import { Pool, PoolConfig } from 'pg'
import { ConnectionRequest } from '../routes/types'


interface Connection {
  id: number;
  host: string;
  port: number;
  database: string;
  user: string;
}

class ConnectionController {
  private connections: Connection[] = [];

  // Renvoie la liste de toutes les connexions
  async getConnections(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.send(this.connections);  // Renvoie les connexions
  }

  async createConnection(request: FastifyRequest<{ Body: ConnectionRequest }>, reply: FastifyReply): Promise<void> {
    const { host, port, database, user, password } = request.body;

    if (!host || !port || !database || !user || !password) {
      reply.code(400).send({ error: 'Tous les paramètres sont requis' });
      return;
    }

    const poolConfig: PoolConfig = { host, port, database, user, password };
    const pool = new Pool(poolConfig);

    try {
      await pool.query('SELECT NOW()');
      const newConnection: Connection = {
        id: this.connections.length + 1,
        host,
        port,
        database,
        user
      };
      this.connections.push(newConnection);

      reply.code(201).send(newConnection);  // Renvoie la nouvelle connexion créée
    } catch (error) {
      reply.code(500).send({ error: 'Impossible de se connecter à la base de données' });
    } finally {
      await pool.end();
    }
  }
}

export default new ConnectionController();
