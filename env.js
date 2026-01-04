import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3002,
  db: process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  } : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'koshub_living_support',
  },
  jwtSecret: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'your_jwt_secret',
  accommodationServiceUrl: process.env.ACCOMMODATION_SERVICE_URL || 'http://localhost:3001',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  }
};
