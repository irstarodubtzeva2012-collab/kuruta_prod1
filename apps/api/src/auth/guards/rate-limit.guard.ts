import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }

  async shouldThrow(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = context.getHandler().name;

    // Custom rate limits for specific routes
    if (route === 'login' || route === 'register') {
      // 5 attempts per minute for auth endpoints
      const ttl = 60000; // 1 minute
      const limit = 5;
      
      const tracker = await this.getTracker(request);
      const key = `${tracker}-${route}`;
      
      // In production, use Redis for distributed rate limiting
      // For now, using in-memory storage
      const { totalHits } = await this.storageService.increment(key, ttl);
      
      if (totalHits > limit) {
        throw new Error('Too many attempts. Please try again later.');
      }
      
      return false;
    }

    return super.shouldThrow(context);
  }
}
