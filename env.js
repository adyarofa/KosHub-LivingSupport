import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3010,
  db: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  },
  jwtSecret: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'your_jwt_secret',
  accommodationServiceUrl: process.env.ACCOMMODATION_SERVICE_URL || 'http://localhost:3001',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  }
};
