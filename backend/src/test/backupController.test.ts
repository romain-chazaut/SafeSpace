import { BackupController } from '../controllers/backupController';
import { BackupService } from '../services/backupService';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseConfig } from '../services/types';
import { DatabaseService } from '../services/database.service';

jest.mock('../services/backupService');

describe('BackupController Comprehensive Tests', () => {
  let backupController: BackupController;
  let backupService: jest.Mocked<BackupService>;
  let mockReply: FastifyReply;

  beforeEach(() => {
    const mockDatabaseService = {} as jest.Mocked<DatabaseService>;
    backupService = new BackupService(mockDatabaseService) as jest.Mocked<BackupService>;
    
    backupController = new BackupController(backupService);
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;
  });

  // Test for creating a backup successfully
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

  // Error handling for network issues during backup creation
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

  // Error handling for permission issues during backup creation
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

  // Error handling for invalid path during backup creation
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

  // Test for getBackupHistory with valid pagination
  it('should retrieve backup history with pagination', async () => {
    const request = {
      query: { page: '1', limit: '10' },
    } as FastifyRequest<{ Querystring: { page?: string; limit?: string } }>;

    const mockHistory = [{ id: 1, database: 'test_db', date: '2024-10-29' }];
    backupService.getBackupHistory.mockResolvedValue({ rows: mockHistory, totalCount: 1 });

    await backupController.getBackupHistory(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      history: mockHistory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
      },
    });
  });

  // Test for invalid pagination values in getBackupHistory
  it('should handle invalid pagination values in getBackupHistory', async () => {
    const request = {
      query: { page: 'notANumber', limit: 'notANumber' },
    } as FastifyRequest<{ Querystring: { page?: string; limit?: string } }>;

    await backupController.getBackupHistory(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to retrieve backup history',
      error: expect.any(String),
    });
  });

  // Test for restoring a database successfully
  it('should restore a database successfully', async () => {
    const request = {
      params: { sourceBackupId: '1' },
      body: { targetDatabaseName: 'restored_db' },
    } as FastifyRequest<{ Params: { sourceBackupId: string }; Body: { targetDatabaseName: string } }>;

    backupService.restoreDatabase.mockResolvedValue();

    await backupController.restoreDatabase(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Database restored successfully',
    });
  });

  // Test for handling not found error during restore
  it('should handle not found error during restore', async () => {
    const request = {
      params: { sourceBackupId: '999' },
      body: { targetDatabaseName: 'non_existent_db' },
    } as FastifyRequest<{ Params: { sourceBackupId: string }; Body: { targetDatabaseName: string } }>;

    const notFoundError = new Error('Aucun backup trouvé');
    backupService.restoreDatabase.mockRejectedValue(notFoundError);

    await backupController.restoreDatabase(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Aucun backup trouvé',
    });
  });

  // Test for listing backups with a database filter
  it('should list backups for a specific database', async () => {
    const request = {
      query: { databaseName: 'test_db' },
    } as FastifyRequest<{ Querystring: { databaseName?: string } }>;

    const mockBackups = [{ id: 1, database: 'test_db', path: '/backup/path' }];
    backupService.listBackups.mockResolvedValue(mockBackups);

    await backupController.listBackups(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      backups: mockBackups,
    });
  });

  // Test for listing all backups when no filter is provided
  it('should list all backups when no database filter is provided', async () => {
    const request = {
      query: {},
    } as FastifyRequest<{ Querystring: { databaseName?: string } }>;

    const mockBackups = [
      { id: 1, database: 'test_db', path: '/backup/path1' },
      { id: 2, database: 'another_db', path: '/backup/path2' },
    ];
    backupService.listBackups.mockResolvedValue(mockBackups);

    await backupController.listBackups(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      backups: mockBackups,
    });
  });
});
