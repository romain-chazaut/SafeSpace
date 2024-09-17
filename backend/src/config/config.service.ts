import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export class ConfigService {
  static get(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }
}