export interface DatabaseConfig {
    database: string;
  }
  
  export interface BackupResult {
    dumpPath: string;
    backupId: number;
  }