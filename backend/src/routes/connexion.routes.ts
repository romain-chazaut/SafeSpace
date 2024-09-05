import { FastifyInstance } from 'fastify'
import connectionController from '../controllers/connectionController'
import { ConnectionRequest } from './types'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/connections', connectionController.getConnections.bind(connectionController))

  fastify.post<{ Body: ConnectionRequest }>('/connections', connectionController.createConnection.bind(connectionController))
  
}