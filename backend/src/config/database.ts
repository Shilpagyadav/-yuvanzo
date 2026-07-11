import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: mysql.Pool;

export const createConnection = async (): Promise<void> => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'multi_vendor_food_delivery',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();

    await pool.query('SELECT 1');
    console.log('✅ Database health check passed');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️  Make sure MySQL is running and database exists');
    process.exit(1);
  }
};

export const getPool = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call createConnection() first.');
  }
  return pool;
};