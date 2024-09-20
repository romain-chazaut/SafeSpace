import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import cronRoutes from '../routes/cron.routes';
import { CronController } from '../controllers/CronController';

// Mock du contrôleur pour vérifier que les méthodes sont appelées
jest.mock('../controllers/CronController');

describe('Cron Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = require('fastify')();
    app.register(cronRoutes); // Enregistrer les routes pour le test
    await app.ready();
  });

  afterAll(() => {
    app.close();
  });

  describe('GET /crons', () => {
    it('should return a list of cron jobs', async () => {
      // Corriger le mock pour qu'il retourne la valeur attendue
      const mockListCrons = CronController.prototype.listCrons as jest.Mock;
      mockListCrons.mockImplementation((request, reply) => {
        reply.send({ success: true, jobs: ['testJob'] });
      });

      const response = await supertest(app.server)
        .get('/crons')
        .expect(200);

      expect(response.body).toEqual({ success: true, jobs: ['testJob'] });
      expect(mockListCrons).toHaveBeenCalled();
    });
  });

  describe('POST /crons', () => {
    it('should start a cron job successfully', async () => {
      const mockStartCron = CronController.prototype.startCron as jest.Mock;
      mockStartCron.mockImplementation((request, reply) => {
        reply.send({ success: true, message: 'Tâche cron "testJob" ajoutée avec succès.' });
      });

      const response = await supertest(app.server)
        .post('/crons')
        .send({ jobName: 'testJob', schedule: '* * * * *', database: 'test_db' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Tâche cron "testJob" ajoutée avec succès.',
      });
      expect(mockStartCron).toHaveBeenCalled();
    });

    it('should return an error if required fields are missing', async () => {
      const mockStartCron = CronController.prototype.startCron as jest.Mock;
      mockStartCron.mockImplementation((request, reply) => {
        reply.status(400).send({
          success: false,
          message: "Tous les champs 'jobName', 'schedule', et 'database' sont requis.",
        });
      });

      const response = await supertest(app.server)
        .post('/crons')
        .send({ jobName: '', schedule: '', database: '' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "Tous les champs 'jobName', 'schedule', et 'database' sont requis.",
      });
    });
  });

  describe('DELETE /crons/:jobName', () => {
    it('should stop a cron job successfully', async () => {
      const mockStopCron = CronController.prototype.stopCron as jest.Mock;
      mockStopCron.mockImplementation((request, reply) => {
        reply.send({ success: true, message: 'Tâche cron "testJob" supprimée avec succès.' });
      });

      const response = await supertest(app.server)
        .delete('/crons/testJob')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Tâche cron "testJob" supprimée avec succès.',
      });
      expect(mockStopCron).toHaveBeenCalled();
    });

    it('should return an error if the cron job does not exist', async () => {
      const mockStopCron = CronController.prototype.stopCron as jest.Mock;
      mockStopCron.mockImplementation((request, reply) => {
        reply.status(404).send({
          success: false,
          message: 'Tâche cron "nonexistentJob" non trouvée.',
        });
      });

      const response = await supertest(app.server)
        .delete('/crons/nonexistentJob')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Tâche cron "nonexistentJob" non trouvée.',
      });
    });
  });
});
