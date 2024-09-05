import Fastify from 'fastify'
import cors from '@fastify/cors'
import connectionRoutes from './routes/connexion.routes'

const fastify = Fastify({
  logger: true
})

// Enregistrez le plugin CORS
fastify.register(cors, {
  // Configuration du CORS
  origin: true, // Autorise toutes les origines
  // Vous pouvez aussi spécifier des origines spécifiques :
  // origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})

// Enregistrez les routes
fastify.register(connectionRoutes)

// Démarrez le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log(`Server is running on http://localhost:3000`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()