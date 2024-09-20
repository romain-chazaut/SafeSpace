import cron, { ScheduledTask } from 'node-cron';
import { CronService } from '../services/CronService';
import { BackupService } from '../services/backupService';
import { DatabaseConfig } from '../services/types';

jest.mock('node-cron');
jest.mock('../services/backupService');

describe('CronService', () => {
  let cronService: CronService;
  let backupService: BackupService;

  beforeEach(() => {
    cronService = new CronService();
    backupService = new BackupService();
  });

  describe('startCronJob', () => {
    it('should start a cron job successfully', () => {
      const jobName = 'testJob';
      const schedule = '* * * * *';
      const dbConfig: DatabaseConfig = { database: 'test_db' };

      // Simuler la création de la tâche cron
      const mockTask: Partial<ScheduledTask> = {
        start: jest.fn(),
      };
      (cron.schedule as jest.Mock).mockReturnValue(mockTask as ScheduledTask);

      cronService.startCronJob(jobName, schedule, dbConfig, backupService);

      expect(cron.schedule).toHaveBeenCalledWith(schedule, expect.any(Function));
      expect(cronService.listCronJobs()).toContain(jobName);
    });

    it('should throw an error if a cron job with the same name already exists', () => {
      const jobName = 'duplicateJob';
      const schedule = '* * * * *';
      const dbConfig: DatabaseConfig = { database: 'test_db' };

      cronService.startCronJob(jobName, schedule, dbConfig, backupService);

      expect(() => {
        cronService.startCronJob(jobName, schedule, dbConfig, backupService);
      }).toThrowError(`Une tâche cron avec le nom "${jobName}" existe déjà.`);
    });
  });

  describe('stopCronJob', () => {
    it('should stop a cron job successfully', () => {
      const jobName = 'testJob';
      const schedule = '* * * * *';
      const dbConfig: DatabaseConfig = { database: 'test_db' };

      const mockTask: Partial<ScheduledTask> = {
        stop: jest.fn(),
      };
      (cron.schedule as jest.Mock).mockReturnValue(mockTask as ScheduledTask);

      cronService.startCronJob(jobName, schedule, dbConfig, backupService);
      const result = cronService.stopCronJob(jobName);

      expect(result).toBe(true);
      expect(mockTask.stop).toHaveBeenCalled();
      expect(cronService.listCronJobs()).not.toContain(jobName);
    });

    it('should return false if the cron job does not exist', () => {
      const result = cronService.stopCronJob('nonexistentJob');
      expect(result).toBe(false);
    });
  });

  describe('listCronJobs', () => {
    it('should return the list of cron jobs', () => {
      const jobName = 'testJob';
      const schedule = '* * * * *';
      const dbConfig: DatabaseConfig = { database: 'test_db' };

      const mockTask: Partial<ScheduledTask> = {
        start: jest.fn(),
      };
      (cron.schedule as jest.Mock).mockReturnValue(mockTask as ScheduledTask);

      cronService.startCronJob(jobName, schedule, dbConfig, backupService);
      const jobs = cronService.listCronJobs();

      expect(jobs).toContain(jobName);
    });
  });
});
