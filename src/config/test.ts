export const TEST_CONFIG = {
  REDIS_URL: 'redis://localhost:6379/1', // Using database 1 for testing
  JWT_SECRET: 'test-secret-key',
  MOCK_ADMIN: {
    username: 'testadmin',
    password: 'testpass123',
    role: 'admin'
  },
  OMISE: {
    PUBLIC_KEY: 'test_public_key',
    SECRET_KEY: 'test_secret_key'
  }
}; 