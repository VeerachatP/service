import { setupTestEnvironment } from '../test/setup';
import { TEST_CONFIG } from '../config/test';
import dotenv from 'dotenv';

dotenv.config();

describe('AdminService', () => {
  let testEnv: Awaited<ReturnType<typeof setupTestEnvironment>>;

  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
  });

  afterAll(async () => {
    await testEnv.redis.redis.quit();
  });

  beforeEach(async () => {
    await testEnv.redis.redis.flushdb();
  });

  it('should create an admin user', async () => {
    const admin = await testEnv.adminService.createAdmin('newadmin', 'pass123', 'admin');
    
    expect(admin).toHaveProperty('id');
    expect(admin.username).toBe('newadmin');
    expect(admin.role).toBe('admin');
    expect(admin).not.toHaveProperty('password');
  });

  it('should authenticate admin with correct credentials', async () => {
    const token = await testEnv.adminService.authenticate(
      TEST_CONFIG.MOCK_ADMIN.username,
      TEST_CONFIG.MOCK_ADMIN.password
    );
    expect(token).toBeTruthy();
  });

  it('should reject authentication with incorrect password', async () => {
    const token = await testEnv.adminService.authenticate(
      TEST_CONFIG.MOCK_ADMIN.username,
      'wrongpassword'
    );
    expect(token).toBeNull();
  });
}); 