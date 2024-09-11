import { Pool, PoolConfig } from 'pg'


export function createPool(config: PoolConfig = {}): Pool {
  return new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost', // Utilisez 'localhost' par défaut
    database: process.env.DB_NAME || 'SafeSpace',
    password: process.env.DB_PASSWORD || 'mysecretpassword',
    port: parseInt(process.env.DB_PORT || '5432'),
    ...config
  })
}

export async function testConnection(pool: Pool): Promise<{ success: boolean; message: string; timestamp?: Date }> {
  let client = null
  try {
    client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    return { success: true, message: 'Connected to the database', timestamp: result.rows[0].now }
  } catch (err) {
    console.error('Database connection error', err)
    return { success: false, message: 'Failed to connect to the database' }
  } finally {
    if (client) client.release()
  }
}