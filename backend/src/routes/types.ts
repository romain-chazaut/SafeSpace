// src/routes/types.ts
export interface ConnectionRequest {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }