// backend/src/database/services/database.service.ts
import { DatabaseConnection } from '../entities/DatabaseConnection';
import { Repository } from 'typeorm';
import { DatabaseModule } from '../database.module';

export class DatabaseService {
  private repository: Repository<DatabaseConnection>;

  constructor() {
    this.repository = DatabaseModule.getRepository(DatabaseConnection);
  }

  async addConnection(connection: Partial<DatabaseConnection>) {
    return this.repository.save(connection);
  }

  async removeConnection(id: number) {
    return this.repository.delete(id);
  }

  async getConnections() {
    return this.repository.find();
  }
}
