import { BackupService } from '../services/backupService';
import { DatabaseService } from '../services/database.service';
import { Pool } from 'pg';

jest.mock('pg');

describe('BackupService', () => {
  let backupService: BackupService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockPool = new Pool() as jest.Mocked<Pool>;
    backupService = new BackupService(mockDatabaseService);
  });

  it('should create a backup successfully', async () => {
    const mockDumpPath = '/path/to/dump.sql';
    jest.spyOn(backupService, 'createDump').mockResolvedValue(mockDumpPath);

    const result = await backupService.createDump({
        database: 'test_db',
        host: '',
        port: 0,
        user: '',
        password: ''
    });

    expect(result).toEqual(mockDumpPath);
  });

  it('should throw an error if backup fails due to network issue', async () => {
    const networkError = new Error('Network error');
    jest.spyOn(backupService, 'createDump').mockRejectedValue(networkError);

    await expect(backupService.createDump({
        database: 'network_db',
        host: '',
        port: 0,
        user: '',
        password: ''
    })).rejects.toThrow('Network error');
  });

  it('should handle permission error during backup creation', async () => {
    const permissionError = new Error('Permission denied');
    jest.spyOn(backupService, 'createDump').mockRejectedValue(permissionError);

    await expect(backupService.createDump({
        database: 'restricted_db',
        host: '',
        port: 0,
        user: '',
        password: ''
    })).rejects.toThrow('Permission denied');
  });
});
