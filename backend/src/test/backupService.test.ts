import { BackupService } from '../services/backupService';
import { DatabaseService } from '../services/database.service';
import { exec } from 'child_process';
import fs from 'fs/promises';
import cron from 'node-cron';

// Mock des modules nécessaires
jest.mock('child_process', () => ({ exec: jest.fn() }));
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  access: jest.fn(),
}));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));

describe('BackupService', () => {
  let backupService: BackupService;
  let databaseServiceMock: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // Création du mock pour databaseService
    databaseServiceMock = {
      getPool: jest.fn().mockReturnValue({
        query: jest.fn() as jest.Mock, // Ici on spécifie explicitement que query est un jest.Mock
        options: { user: 'user', password: 'password' },
      }),
      createNewConnection: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    backupService = new BackupService(databaseServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should call checkBackupTables', async () => {
      const spy = jest.spyOn(backupService, 'checkBackupTables' as any);
      await backupService.initialize();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkBackupTables', () => {
    it('should call createBackupTable and createBackupHistoryTable', async () => {
      const createBackupTableSpy = jest.spyOn(backupService, 'createBackupTable' as any);
      const createBackupHistoryTableSpy = jest.spyOn(backupService, 'createBackupHistoryTable' as any);

      await backupService['checkBackupTables']();
      expect(createBackupTableSpy).toHaveBeenCalled();
      expect(createBackupHistoryTableSpy).toHaveBeenCalled();
    });
  });

  describe('createBackupTable', () => {
    it('should execute SQL query to create the backup table', async () => {
      await backupService['createBackupTable']();
      expect(databaseServiceMock.getPool().query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS backup'));
    });
  });

  describe('createBackupHistoryTable', () => {
    it('should execute SQL query to create the backup_history table', async () => {
      await backupService['createBackupHistoryTable']();
      expect(databaseServiceMock.getPool().query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS backup_history'));
    });
  });

  describe('execCommand', () => {
    it('should resolve with stdout on successful command execution', async () => {
      (exec as unknown as jest.Mock).mockImplementation((_, callback) => callback(null, 'success', ''));

      const result = await backupService['execCommand']('echo success');
      expect(result).toBe('success');
    });

    it('should reject with error message on command failure', async () => {
      (exec as unknown as jest.Mock).mockImplementation((_, callback) => callback(new Error('command failed'), '', 'stderr output'));

      await expect(backupService['execCommand']('invalid command')).rejects.toThrow('command failed');
    });
  });

  describe('createDump', () => {
    it('should create a backup and save to database', async () => {
      const dbConfig = {
        database: 'test_db',
        host: 'localhost',
        port: 5432,
        user: 'your_user',
        password: 'your_password'
      };
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (exec as unknown as jest.Mock).mockImplementation((_, callback) => callback(null, 'Dump created', ''));
      jest.spyOn(backupService, 'saveBackupInfo').mockResolvedValue(1);
      jest.spyOn(backupService, 'saveBackupHistoryInfo').mockResolvedValue();

      const result = await backupService.createDump(dbConfig);
      expect(result).toContain('dump_test_db');
      expect(backupService.saveBackupInfo).toHaveBeenCalled();
      expect(backupService.saveBackupHistoryInfo).toHaveBeenCalled();
    });
  });

  describe('saveBackupInfo', () => {
    it('should insert backup info into backup table and return id', async () => {
      const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
      (databaseServiceMock.getPool().query as jest.Mock) = queryMock; // Explicitement le caster en jest.Mock

      const backupPath = 'path/to/backup.sql';
      const dbConfig = {
        database: 'test_db',
        host: 'localhost',
        port: 5432,
        user: 'your_user',
        password: 'your_password'
      };
      const result = await backupService.saveBackupInfo(backupPath, dbConfig);

      expect(result).toBe(1);
      expect(queryMock).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
    });
  });

  describe('saveBackupHistoryInfo', () => {
    it('should insert history info into backup_history table', async () => {
      const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
      (databaseServiceMock.getPool().query as jest.Mock) = queryMock;

      const backupId = 1;
      const backupPath = 'path/to/backup.sql';
      await backupService.saveBackupHistoryInfo(backupId, backupPath, 'test_db');

      expect(queryMock).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
    });
  });

  describe('getBackupHistory', () => {
    it('should return backup history with pagination', async () => {
      const historyRows = [{ id: 1, path: 'path/to/backup.sql' }];
      (databaseServiceMock.getPool().query as jest.Mock)
        .mockResolvedValueOnce({ rows: historyRows })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await backupService.getBackupHistory(1, 10);
      expect(result).toEqual({ rows: historyRows, totalCount: 1 });
    });
  });

  describe('restoreDatabase', () => {
    it('should restore database from a backup file', async () => {
      (databaseServiceMock.getPool().query as jest.Mock).mockResolvedValue({ rows: [{ path: 'path/to/backup.sql', name_database: 'test_db' }] });
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (exec as unknown as jest.Mock).mockImplementation((_, callback) => callback(null, 'Restore success', ''));

      await backupService.restoreDatabase(1, 'restored_db');
      expect(exec).toHaveBeenCalled();
    });
  });

  describe('startCronJob', () => {
    it('should schedule a cron job for backup', () => {
      const dbConfig = {
        database: 'test_db',
        host: 'localhost',
        port: 5432,
        user: 'your_user',
        password: 'your_password'
      };
      backupService.startCronJob(dbConfig, '0 0 * * *');
      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
    });
  });

  describe('listBackups', () => {
    it('should list all backups or backups for a specific database', async () => {
      (databaseServiceMock.getPool().query as jest.Mock).mockResolvedValue({ rows: [{ id: 1, name_database: 'test_db' }] });

      const result = await backupService.listBackups();
      expect(result).toEqual([{ id: 1, name_database: 'test_db' }]);
    });
  });

  describe('createDatabaseIfNotExists', () => {
    it('should create database if not exists', async () => {
      (databaseServiceMock.getPool().query as jest.Mock).mockResolvedValue({ rows: [] });
      (exec as unknown as jest.Mock).mockImplementation((_, callback) => callback(null, 'DB created', ''));

      await backupService['createDatabaseIfNotExists']('new_db');
      expect(exec).toHaveBeenCalled();
    });
  });
});
