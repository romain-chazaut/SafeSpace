import { BackupController } from '../controllers/backupController';
import { BackupService } from '../services/backupService';
import { DatabaseService } from '../services/database.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseConfig } from '../services/types';

jest.mock('../services/backupService');
jest.mock('../services/database.service');

describe('BackupController', () => {
  let backupController: BackupController;
  let backupService: jest.Mocked<BackupService>;
  let mockReply: FastifyReply;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    const databaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    backupService = new BackupService(databaseService) as jest.Mocked<BackupService>;
    backupController = new BackupController(backupService);
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;
  });

  it('should create a backup successfully', async () => {
    const request = {
      body: { database: 'test_db' } as DatabaseConfig,
    } as FastifyRequest<{ Body: DatabaseConfig }>;

    const mockDumpPath = '/path/to/dump.sql';
    backupService.createDump.mockResolvedValue(mockDumpPath);

    await backupController.createBackup(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Backup created successfully',
      backupPath: mockDumpPath,
    });
  });

  it('should handle network error during backup creation', async () => {
    const request = { body: { database: 'network_db' } } as FastifyRequest<{ Body: DatabaseConfig }>;
    const networkError = new Error('Network error');
    backupService.createDump.mockRejectedValue(networkError);

    await backupController.createBackup(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Backup creation failed',
      error: networkError.message,
    });
  });

  it('should handle permission error during backup creation', async () => {
    const request = { body: { database: 'restricted_db' } } as FastifyRequest<{ Body: DatabaseConfig }>;
    const permissionError = new Error('Permission denied');
    backupService.createDump.mockRejectedValue(permissionError);

    await backupController.createBackup(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Backup creation failed',
      error: permissionError.message,
    });
  });

  it('should handle invalid path error during backup creation', async () => {
    const request = { body: { database: 'invalid_path_db' } } as FastifyRequest<{ Body: DatabaseConfig }>;
    const pathError = new Error('Invalid path');
    backupService.createDump.mockRejectedValue(pathError);

    await backupController.createBackup(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Backup creation failed',
      error: pathError.message,
    });
  });
});
