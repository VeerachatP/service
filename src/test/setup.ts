import { RedisService } from 'src/services/redis';
import { AdminService } from 'src/services/admin';
import { TEST_CONFIG } from 'src/config/test';

export const setupTestEnvironment = async () => {
  const redis = new RedisService();
  const adminService = new AdminService();

  // Clear test database
  await redis.redis.flushdb();

  // Create test admin
  await adminService.createAdmin(
    TEST_CONFIG.MOCK_ADMIN.username,
    TEST_CONFIG.MOCK_ADMIN.password,
    TEST_CONFIG.MOCK_ADMIN.role as 'admin'
  );

  return { redis, adminService };
}; 