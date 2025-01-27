import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RedisService } from './redis';
import { config } from 'src/config/env';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'manager';
}

export class AdminService {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  async createAdmin(username: string, password: string, role: 'admin' | 'manager'): Promise<AdminUser> {
    const id = `admin_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const key = `admin:${username}`;

    const admin: AdminUser & { password: string } = {
      id,
      username,
      role,
      password: hashedPassword
    };

    await this.redis.hmset(key, admin);

    const { password: _, ...adminData } = admin;
    return adminData;
  }

  async authenticate(username: string, password: string): Promise<string | null> {
    const key = `admin:${username}`;
    const admin = await this.redis.hgetall(key);

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return token;
  }
} 