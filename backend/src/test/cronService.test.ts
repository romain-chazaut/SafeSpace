import { CronService } from '../services/CronService';
import { Server as SocketIOServer } from 'socket.io';
import { BackupService } from '../services/backupService';
import { DatabaseService } from '../services/database.service';
import { DatabaseConfig } from '../services/types';
import cron from 'node-cron';

jest.mock('node-cron');
jest.mock('../services/backupService');
jest.mock('socket.io');
jest.mock('../services/database.service'); // Mock du DatabaseService

describe('CronService', () => {
  let cronService: CronService;
  let mockIo: jest.Mocked<SocketIOServer>;
  let mockBackupService: jest.Mocked<BackupService>;
  let mockDatabaseService: jest.Mocked<DatabaseService>; // Création du mock de DatabaseService

  beforeEach(() => {
    mockIo = new SocketIOServer() as jest.Mocked<SocketIOServer>;
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>; // Initialisation du mock de DatabaseService
    mockBackupService = new BackupService(mockDatabaseService) as jest.Mocked<BackupService>; // Injection de mockDatabaseService
    cronService = new CronService(mockIo);
  });

  it('should start a cron job successfully', () => {
    const jobName = 'dailyBackup';
    const schedule = '* * * * *';
    const dbConfig: DatabaseConfig = {
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
      host: 'localhost',
      port: 5432,
    };

    cronService.startCronJob(jobName, schedule, dbConfig, mockBackupService);

    expect(cronService.listCronJobs()).toContain(jobName);
  });

  it('should throw an error if a cron job with the same name already exists', () => {
    const jobName = 'dailyBackup';
    const schedule = '* * * * *';
    const dbConfig: DatabaseConfig = {
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
      host: 'localhost',
      port: 5432,
    };

    cronService.startCronJob(jobName, schedule, dbConfig, mockBackupService);

    expect(() => {
      cronService.startCronJob(jobName, schedule, dbConfig, mockBackupService);
    }).toThrow(`Une tâche cron avec le nom "${jobName}" existe déjà.`);
  });

  it('should stop a cron job successfully', () => {
    const jobName = 'dailyBackup';
    const schedule = '* * * * *';
    const dbConfig: DatabaseConfig = {
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
      host: 'localhost',
      port: 5432,
    };

    cronService.startCronJob(jobName, schedule, dbConfig, mockBackupService);
    const result = cronService.stopCronJob(jobName);

    expect(result).toBe(true);
    expect(cronService.listCronJobs()).not.toContain(jobName);
  });

  it('should return false if trying to stop a non-existent cron job', () => {
    const result = cronService.stopCronJob('nonExistentJob');
    expect(result).toBe(false);
  });
});
