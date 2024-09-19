import { FastifyRequest, FastifyReply } from 'fastify';
import { CronController } from '../controllers/CronController';
import { CronService } from '../services/CronService';
import { BackupService } from '../services/backupService';

// Création de mocks pour CronService et BackupService
jest.mock('../services/CronService');
jest.mock('../services/backupService');

describe('CronController', () => {
  let cronController: CronController;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    // Initialisation du contrôleur
    cronController = new CronController();

    // Mock de FastifyReply pour capturer les réponses
    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('listCrons', () => {
    it('should return a list of cron jobs', async () => {
      // Liste simulée de tâches cron
      const mockJobs = [{ jobName: 'testJob', schedule: '* * * * *' }];
      (cronController['cronService'].listCronJobs as jest.Mock).mockReturnValue(mockJobs);

      // Mock request sans besoin de paramètres spécifiques
      const mockRequest = {} as FastifyRequest;

      // Appel de la méthode listCrons
      await cronController.listCrons(mockRequest, mockReply as FastifyReply);

      // Vérifications
      expect(cronController['cronService'].listCronJobs).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({ success: true, jobs: mockJobs });
    });

    it('should return an empty list if no cron jobs are found', async () => {
      // Aucune tâche cron
      const mockJobs: any[] = [];
      (cronController['cronService'].listCronJobs as jest.Mock).mockReturnValue(mockJobs);

      const mockRequest = {} as FastifyRequest;

      await cronController.listCrons(mockRequest, mockReply as FastifyReply);

      expect(mockReply.send).toHaveBeenCalledWith({ success: true, jobs: mockJobs });
    });
  });

  describe('startCron', () => {
    it('should start a cron job successfully', async () => {
      const mockRequest = {
        body: { jobName: 'testJob', schedule: '* * * * *', database: 'test_db' }
      } as FastifyRequest<{ Body: { jobName: string; schedule: string; database: string } }>;

      await cronController.startCron(mockRequest, mockReply as FastifyReply);

      expect(cronController['cronService'].startCronJob).toHaveBeenCalledWith(
        'testJob',
        '* * * * *',
        { database: 'test_db' },
        expect.any(BackupService)
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Tâche cron "testJob" ajoutée avec succès.'
      });
    });

    it('should return an error if required fields are missing', async () => {
      const mockRequest = {
        body: { jobName: '', schedule: '', database: '' }
      } as FastifyRequest<{ Body: { jobName: string; schedule: string; database: string } }>;

      await cronController.startCron(mockRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: "Tous les champs 'jobName', 'schedule', et 'database' sont requis."
      });
    });

    it('should return an error if a cron job with the same name already exists', async () => {
      const mockRequest = {
        body: { jobName: 'testJob', schedule: '* * * * *', database: 'test_db' }
      } as FastifyRequest<{ Body: { jobName: string; schedule: string; database: string } }>;

      // Simuler que la tâche cron existe déjà
      (cronController['cronService'].startCronJob as jest.Mock).mockImplementation(() => {
        throw new Error('Tâche cron déjà existante.');
      });

      await cronController.startCron(mockRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Tâche cron déjà existante.'
      });
    });
  });

  describe('stopCron', () => {
    it('should return an error if the job name is invalid', async () => {
      // Simuler les paramètres de requête avec un nom de tâche vide
      const mockRequest = {
        params: { jobName: '' } // Nom de tâche invalide
      } as FastifyRequest<{ Params: { jobName: string } }>;
  
      await cronController.stopCron(mockRequest, mockReply as FastifyReply);
  
      // Vérification que le statut est bien 400 pour un nom de tâche invalide
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Nom de la tâche cron invalide.'
      });
    });
  });

    it('should return an error if the job name is invalid', async () => {
      const mockRequest = {
        params: { jobName: '' }
      } as FastifyRequest<{ Params: { jobName: string } }>;

      await cronController.stopCron(mockRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Nom de la tâche cron invalide.'
      });
    });
  });
