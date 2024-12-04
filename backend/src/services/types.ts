export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
  
  export interface BackupResult {
    dumpPath: string;
    backupId: number;
  }