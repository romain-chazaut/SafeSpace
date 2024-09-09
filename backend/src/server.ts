import Fastify, { FastifyInstance } from 'fastify'
import 'dotenv/config'
import cors from '@fastify/cors'
import connectionRoutes from './routes/database.routes'
import { createPool, testConnection } from './db'

const fastify: FastifyInstance = Fastify({
  logger: true
})

// Décorer l'instance Fastify avec la connexion à la base de données
fastify.decorate('db', createPool())

fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})

fastify.register(connectionRoutes)

const start = async () => {
  try {
    const dbStatus = await testConnection(fastify.db)
    console.log('Database connection status:', dbStatus)

    if (dbStatus.success) {
      await fastify.listen({ port: 3000, host: '0.0.0.0' })
      console.log(`Server is running on http://localhost:3000`)
    } else {
      throw new Error('Failed to connect to the database')
    }
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()