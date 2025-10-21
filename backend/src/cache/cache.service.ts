import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  cacheKey: string;
}

@Injectable()
export class CacheService {
  private userCacheKeys = new Map<string, Set<string>>();
  
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async getWithMetadata<T>(key: string): Promise<CacheResult<T> | null> {
    const data = await this.cacheManager.get(key);
    if (data) {
      return {
        data: data as T,
        fromCache: true,
        cacheKey: key,
      };
    }
    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
    
    // Track cache keys for invalidation
    if (key.startsWith('notes:')) {
      const userId = key.split(':')[1];
      if (!this.userCacheKeys.has(userId)) {
        this.userCacheKeys.set(userId, new Set());
      }
      this.userCacheKeys.get(userId)!.add(key);
    }
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  getNotesCacheKey(userId: string, searchQuery?: string): string {
    const searchKey = searchQuery ? `:${searchQuery.toLowerCase().trim()}` : '';
    return `notes:${userId}${searchKey}`;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    // Get all tracked cache keys for this user
    const userKeys = this.userCacheKeys.get(userId);
    if (userKeys) {
      // Delete all tracked cache keys for this user
      for (const key of userKeys) {
        await this.del(key);
      }
      // Clear the tracking set
      userKeys.clear();
    }
    
    // Also delete the base patterns as fallback
    const basePatterns = [
      `notes:${userId}`,
      `notes:${userId}:`,
    ];
    
    for (const key of basePatterns) {
      await this.del(key);
    }
  }
}
