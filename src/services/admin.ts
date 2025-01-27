import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RedisService } from './redis';
import { config } from 'src/config/env';

class AdminService {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  // ... rest of the code
}

export { AdminService }; 