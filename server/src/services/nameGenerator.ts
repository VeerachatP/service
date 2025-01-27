interface NameGeneratorOptions {
  gender: string;
  motherName?: string;
  fatherName?: string;
}

class NameGeneratorService {
  private static RATE_LIMIT_WINDOW = 1000; // 1 second
  private requestTimestamps: Map<string, number[]> = new Map();

  private backupNames = {
    male: ['James', 'William', 'Oliver', 'Henry', 'Theodore'],
    female: ['Charlotte', 'Olivia', 'Emma', 'Sophia', 'Ava']
  };

  async generateNames(options: NameGeneratorOptions, ip: string): Promise<string[]> {
    if (this.isRateLimited(ip)) {
      throw new Error('Too many requests. Please try again later.');
    }

    try {
      const names = await this.getFromOpenAI(options);
      return names;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getBackupNames(options.gender);
    }
  }

  private isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(ip) || [];
    
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(t => now - t < this.RATE_LIMIT_WINDOW);
    
    if (recentTimestamps.length >= 5) { // Max 5 requests per second
      return true;
    }

    recentTimestamps.push(now);
    this.requestTimestamps.set(ip, recentTimestamps);
    return false;
  }

  private getBackupNames(gender: string): string[] {
    return this.backupNames[gender.toLowerCase() as 'male' | 'female'];
  }
} 