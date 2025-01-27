interface Config {
  REDIS_URL: string;
  JWT_SECRET: string;
  OMISE_PUBLIC_KEY: string;
  OMISE_SECRET_KEY: string;
  OPENAI_API_KEY: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
}

export const config: Config = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret',
  OMISE_PUBLIC_KEY: process.env.OMISE_PUBLIC_KEY || '',
  OMISE_SECRET_KEY: process.env.OMISE_SECRET_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: (process.env.NODE_ENV as Config['NODE_ENV']) || 'development'
}; 