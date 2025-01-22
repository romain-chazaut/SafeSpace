import { DatabaseService } from '../services/database.service';
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

// Mock du module `pg`
jest.mock('pg', () => {
  const mClient = {
    release: jest.fn(),
    query: jest.fn(),
  };
  const mPool = {
    connect: jest.fn().mockResolvedValue(mClient),
    query: jest.fn(),
    end: jest.fn(),
    options: {},
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let poolMock: jest.Mocked<Pool>;
  let poolClientMock: jest.Mocked<PoolClient>;

  const poolConfig: PoolConfig = {
    user: 'test_user',
    host: 'localhost',
    database: 'test_db',
    password: 'test_password',
    port: 5432,
  };

  beforeEach(() => {
    databaseService = new DatabaseService();
    poolMock = new Pool() as jest.Mocked<Pool>;

    // Forcer le type de `poolClientMock` pour éviter l'erreur `never`
    poolClientMock = {
      release: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<PoolClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializePool', () => {
    it('should initialize a new pool with the provided config', () => {
      databaseService.initializePool(poolConfig);
      expect(Pool).toHaveBeenCalledWith(poolConfig);
    });
  });

  describe('connect', () => {
    it('should initialize a pool and connect successfully if not already initialized', async () => {
      databaseService.initializePool(poolConfig); 
      await databaseService.connect(poolConfig);
      expect(poolMock.connect).toHaveBeenCalled();
    });

    it('should connect successfully if pool is already initialized', async () => {
      databaseService.initializePool(poolConfig);
      await databaseService.connect(poolConfig);
      expect(poolMock.connect).toHaveBeenCalled();
    });

    it('should release the client after connecting', async () => {
      (poolMock.connect as jest.Mock).mockResolvedValue(poolClientMock as unknown as PoolClient);
      
      await databaseService.connect(poolConfig);
      expect(poolClientMock.release).toHaveBeenCalled();
    });

    it('should log an error and throw if connection fails', async () => {
      // Correction du type de l'erreur pour éviter l'erreur `never`
      const error = new Error('Connection failed') as Error;
      (poolMock.connect as jest.Mock).mockRejectedValue(error);

      await expect(databaseService.connect(poolConfig)).rejects.toThrow('Connection failed');
    });
  });

  describe('getPool', () => {
    it('should return the pool if initialized', () => {
      databaseService.initializePool(poolConfig);
      expect(databaseService.getPool()).toBe(poolMock);
    });

    it('should throw an error if pool is not initialized', () => {
      expect(() => databaseService.getPool()).toThrow('Database not connected');
    });
  });

  describe('disconnect', () => {
    it('should disconnect and nullify the pool if initialized', async () => {
      databaseService.initializePool(poolConfig);
      await databaseService.disconnect();
      expect(poolMock.end).toHaveBeenCalled();
      expect(() => databaseService.getPool()).toThrow('Database not connected');
    });

    it('should not attempt to disconnect if pool is not initialized', async () => {
      await databaseService.disconnect();
      expect(poolMock.end).not.toHaveBeenCalled();
    });
  });

  describe('getDatabaseContents', () => {
    it('should retrieve all tables and their contents', async () => {
      databaseService.initializePool(poolConfig);

      // Typage explicite pour chaque valeur `rows` pour éviter l'erreur `never`
      const tablesResult: QueryResult<{ table_name: string }> = {
        rows: [{ table_name: 'test_table' }],
      } as QueryResult<{ table_name: string }>;

      const contentResult: QueryResult<{ id: number; name: string }> = {
        rows: [{ id: 1, name: 'test' }],
      } as QueryResult<{ id: number; name: string }>;

      (poolMock.query as jest.Mock).mockResolvedValueOnce(tablesResult);
      (poolMock.query as jest.Mock).mockResolvedValueOnce(contentResult);

      const result = await databaseService.getDatabaseContents();

      expect(result).toEqual({
        tables: ['test_table'],
        contents: { test_table: [{ id: 1, name: 'test' }] },
      });
    });

    it('should throw an error if retrieving database contents fails', async () => {
      databaseService.initializePool(poolConfig);
      const error = new Error('Query failed') as Error;
      (poolMock.query as jest.Mock).mockRejectedValue(error);

      await expect(databaseService.getDatabaseContents()).rejects.toThrow('Query failed');
    });
  });

  describe('createNewConnection', () => {
    it('should create a new pool with a different database name', async () => {
      databaseService.initializePool(poolConfig);
      const newDatabaseName = 'new_db';
      const newPool = await databaseService.createNewConnection(newDatabaseName);

      expect(newPool).toHaveProperty('query');
      expect(Pool).toHaveBeenCalledWith(expect.objectContaining({ database: newDatabaseName }));
    });

    it('should throw an error if pool is not initialized', async () => {
      await expect(databaseService.createNewConnection('new_db')).rejects.toThrow('Database not connected');
    });
  });

  describe('setPool', () => {
    it('should set a new pool and close the old pool if it exists', async () => {
      const newPoolMock = new Pool() as jest.Mocked<Pool>;

      databaseService.initializePool(poolConfig);
      databaseService.setPool(newPoolMock);

      expect(poolMock.end).toHaveBeenCalled();
      expect(databaseService.getPool()).toBe(newPoolMock);
    });

    it('should set the new pool if no old pool exists', () => {
      const newPoolMock = new Pool() as jest.Mocked<Pool>;

      databaseService.setPool(newPoolMock);
      expect(databaseService.getPool()).toBe(newPoolMock);
    });
  });
});
