import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';

declare module 'fastify' {
  export interface FastifyInstance {
    db: Pool;
  }
}
