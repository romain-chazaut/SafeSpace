// backend/src/database/database.module.ts
import { DataSource } from 'typeorm';
import { DatabaseConnection } from './entities/DatabaseConnection';
import { ConfigService } from '../config/config.service';

export const DatabaseModule = new DataSource({
  type: 'postgres',
  host: ConfigService.get('DB_HOST'),
  port: parseInt(ConfigService.get('DB_PORT')),
  username: ConfigService.get('DB_USERNAME'),
  password: ConfigService.get('DB_PASSWORD'),
  database: ConfigService.get('DB_DATABASE'),
  entities: [DatabaseConnection],
  synchronize: true,
});
