import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { testConnection } from '../db'

export default async function connectionRoutes(fastify: FastifyInstance) {
  fastify.get('/db-status', async (_request: FastifyRequest, reply: FastifyReply) => {
    const status = await testConnection(fastify.db)
    return reply.send(status)
  })
}