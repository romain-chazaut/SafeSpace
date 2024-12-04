import { DatabaseService } from '../services/database.service';
import { Pool, PoolClient } from 'pg';

jest.mock('pg');

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;

  beforeEach(() => {
    // Création des mocks pour Pool et PoolClient
    mockPool = new Pool() as jest.Mocked<Pool>;
    mockClient = {
      release: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<PoolClient>;

    // Assure que `connect` renvoie `mockClient`
    (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);

    // Injecte `mockPool` dans `databaseService`
    databaseService = new DatabaseService();
    (databaseService as any).pool = mockPool;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    await databaseService.connect({
      database: 'test_db',
      user: 'user',
      password: 'pass',
      host: 'localhost',
      port: 5432,
    });

    expect(mockPool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should throw an error if database connection fails', async () => {
    const connectionError = new Error('Connection failed');
    (mockPool.connect as jest.Mock).mockRejectedValue(connectionError);

    await expect(
      databaseService.connect({
        database: 'test_db',
        user: 'user',
        password: 'pass',
        host: 'localhost',
        port: 5432,
      })
    ).rejects.toThrow('Connection failed');
  });
});
