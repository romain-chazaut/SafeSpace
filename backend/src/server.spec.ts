const Fastify = require('fastify')
const supertest = require('supertest')
const connectionRoutes = require('./routes/connexion.routes')

// Mock du connectionController
jest.mock('../controllers/connectionController', () => ({
  getConnections: jest.fn().mockResolvedValue({
    statusCode: 200,
    data: [{ id: '1', status: 'connected' }]
  }),
  createConnection: jest.fn().mockResolvedValue({
    statusCode: 201,
    data: { userId: '1234', token: 'abcd', status: 'connected' }
  })
}))

// Fonction pour créer une instance Fastify pour chaque test
function buildApp() {
  const app = Fastify()
  app.register(connectionRoutes)
  return app
}

describe('Fastify API Tests with Controllers', () => {
  let app: { server: any }

  beforeEach(() => {
    app = buildApp()
  })

  // Test 1: Vérification d'une connexion réussie via le controller
  it('should return 200 and a list of connections', async () => {
    const response = await supertest(app.server)
      .get('/connections') // Utilisation de la route /connections
      .expect(200)

    // Vérifie que la réponse contient les données mockées par getConnections
    expect(response.body).toEqual({
      statusCode: 200,
      data: [{ id: '1', status: 'connected' }]
    })
  })

  // Test 2: Vérification de la création d'une nouvelle connexion (POST)
  it('should create a new connection with POST /connections', async () => {
    const response = await supertest(app.server)
      .post('/connections')
      .send({
        userId: '1234',
        token: 'abcd'
      })
      .expect(201)

    // Vérifie que la réponse contient les données mockées par createConnection
    expect(response.body).toEqual({
      statusCode: 201,
      data: { userId: '1234', token: 'abcd', status: 'connected' }
    })
  })

  // Test 3: Vérification d'une erreur de validation lors de la création
  it('should return 400 for invalid connection data', async () => {
    const response = await supertest(app.server)
      .post('/connections')
      .send({
        userId: '' // Donnée invalide (userId manquant)
      })
      .expect(400)

    // Vérifie le message d'erreur
    expect(response.body).toEqual({
      error: 'Invalid connection data'
    })
  })
})
