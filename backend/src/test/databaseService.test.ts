import { DatabaseService } from '../services/database.service';
import { Pool, PoolClient } from 'pg';

jest.mock('pg');

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;

  beforeEach(() => {
    // Création de mockPool en tant que Pool et assignation explicite pour TypeScript
    mockPool = new (Pool as unknown as jest.Mock<Pool>)() as jest.Mocked<Pool>;

    // Création de mockClient en tant que PoolClient avec une fonction de libération définie
    mockClient = {
      connect: jest.fn(),
      query: jest.fn(),
      release: jest.fn(), // Assurez-vous que release est bien un mock
      end: jest.fn(),
    } as unknown as jest.Mocked<PoolClient>;

    (mockPool.connect as jest.Mock).mockResolvedValue(mockClient); // Résolution de connect avec le client mocké
    databaseService = new DatabaseService();
    (databaseService as any).pool = mockPool; // Injection du mockPool dans databaseService
  });

  it('should connect to the database successfully', async () => {
    await databaseService.connect({
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
      host: 'localhost',
      port: 5432,
    });

    expect(mockPool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled(); // Vérification que release est bien appelé
  });

  it('should throw an error if database connection fails', async () => {
    const connectionError = new Error('Connection failed');
    (mockPool.connect as jest.Mock).mockRejectedValue(connectionError); // Mock de rejet pour simulateur une erreur

    await expect(
      databaseService.connect({
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        host: 'localhost',
        port: 5432,
      })
    ).rejects.toThrow('Connection failed');
  });
});
