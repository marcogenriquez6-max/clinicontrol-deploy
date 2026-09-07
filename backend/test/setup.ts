import { config } from 'dotenv';

config();

process.env.DB_TYPE = 'sqlite';
process.env.DB_PATH = ':memory:';
process.env.DB_SYNC = 'true';
process.env.DB_LOGGING = 'true';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-secret-key-that-is-at-least-32-chars!';
