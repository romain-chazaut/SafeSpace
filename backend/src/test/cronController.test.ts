// Test pour les fonctionnalités avancées du CronController avec validation et gestion des erreurs
import { CronController } from '../controllers/CronController';
import { CronService } from '../services/CronService';
import { DatabaseService } from '../services/database.service';
import { BackupService } from '../services/backupService';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseConfig } from '../services/types';
import { Server as SocketIOServer } from 'socket.io';

jest.mock('../services/CronService');
jest.mock('../services/database.service');
jest.mock('../services/backupService');

describe('CronController - Tests avancés', () => {
  let cronController: CronController;
  let cronService: jest.Mocked<CronService>;
  let databaseService: jest.Mocked<DatabaseService>;
  let backupService: jest.Mocked<BackupService>;
  let mockReply: FastifyReply;
  let mockIo: SocketIOServer;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    databaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockIo = {} as SocketIOServer;
    cronService = new CronService(mockIo) as jest.Mocked<CronService>;
    backupService = new BackupService(databaseService) as jest.Mocked<BackupService>;
    cronController = new CronController(databaseService, cronService, backupService);
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;
  });

  it('should start a cron job successfully', async () => {
    const request = {
      body: { jobName: 'dailyBackup', schedule: '* * * * *', dbConfig: { database: 'test_db' } as DatabaseConfig },
    } as FastifyRequest<{ Body: { jobName: string; schedule: string; dbConfig: DatabaseConfig; description?: string } }>;

    await cronController.startCron(request, mockReply);

    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Tâche cron "dailyBackup" ajoutée avec succès.',
    });
  });

  it('should return error if cron job already exists', async () => {
    const request = {
      body: { jobName: 'dailyBackup', schedule: '* * * * *', dbConfig: { database: 'test_db' } as DatabaseConfig },
    } as FastifyRequest<{ Body: { jobName: string; schedule: string; dbConfig: DatabaseConfig; description?: string } }>;

    cronService.startCronJob.mockImplementation(() => {
      throw new Error('Une tâche cron avec le nom "dailyBackup" existe déjà.');
    });

    await cronController.startCron(request, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Une tâche cron avec le nom "dailyBackup" existe déjà.',
    });
  });
});
