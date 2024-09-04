const fastify = require('fastify')({ logger: true })
const { Pool } = require('pg')

// Stockage temporaire des connexions (à remplacer par une vraie base de données)
const connections = []

// Route GET à la racine
fastify.get('/', async (request:any, reply:any) => {
  reply.send({ hello: 'world' })
})

// Route POST pour ajouter une connexion
fastify.post('/connections', async (request:any, reply:any) => {
  const { host, port, database, user, password } = request.body

  // Vérification des paramètres requis
  if (!host || !port || !database || !user || !password) {
    reply.code(400).send({ error: 'Tous les paramètres sont requis' })
    return
  }

  // Création d'un pool de connexions
  const pool = new Pool({
    host,
    port,
    database,
    user,
    password,
  })

  try {
    // Test de la connexion
    await pool.query('SELECT NOW()')

    // Ajout de la connexion à la liste
    const newConnection = { id: connections.length + 1, host, port, database, user }
    connections.push(newConnection)

    reply.code(201).send(newConnection)
  } catch (error) {
    reply.code(500).send({ error: 'Impossible de se connecter à la base de données' })
  }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Serveur en cours d\'écoute sur http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()