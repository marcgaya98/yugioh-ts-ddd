import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const databaseName = process.env.DB_NAME || 'yugioh_db';
const databaseUser = process.env.DB_USER || 'dbeaveruser';
const databasePassword = process.env.DB_PASS || process.env.DB_PASSWORD || '123456';
const databaseHost = process.env.DB_HOST || 'localhost';
const databasePort = Number(process.env.DB_PORT || 3306);

export const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
  host: databaseHost,
  port: databasePort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000,
    charset: 'utf8mb4'
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

export async function authenticateDatabase(): Promise<boolean> {
  await sequelize.authenticate();
  return true;
}

