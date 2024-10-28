import { DatabaseController } from '../controllers/database.controller';
import { DatabaseService } from '../services/database.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PoolConfig } from 'pg';

jest.mock('../services/database.service');

describe('DatabaseController', () => {
  let databaseController: DatabaseController;
  let databaseService: jest.Mocked<DatabaseService>;
  let mockReply: FastifyReply;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    databaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    databaseController = new DatabaseController(databaseService);
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;
  });

  it('should connect to the database successfully', async () => {
    const request = { body: { database: 'test_db', user: 'test_user', password: 'test_password', host: 'localhost', port: 5432 } } as FastifyRequest<{ Body: PoolConfig }>;

    await databaseController.connect(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Connected to database',
    });
  });

  it('should handle error if connection fails', async () => {
    const request = { body: { database: 'test_db', user: 'test_user', password: 'test_password', host: 'localhost', port: 5432 } } as FastifyRequest<{ Body: PoolConfig }>;
    databaseService.connect.mockRejectedValue(new Error('Connection failed'));

    await databaseController.connect(request, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Connection failed',
    });
  });
});
