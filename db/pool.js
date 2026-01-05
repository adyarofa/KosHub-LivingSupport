import pkg from 'pg';
import { config } from '../env.js';

const { Pool } = pkg;

const pool = new Pool(
  typeof config.db === 'object' && config.db.connectionString
    ? config.db
    : {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
      }
);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
