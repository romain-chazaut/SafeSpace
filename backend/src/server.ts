import Fastify from 'fastify'
import connectionRoutes from './routes/connexion.routes'

const fastify = Fastify({
  logger: true
})

fastify.register(connectionRoutes)

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()