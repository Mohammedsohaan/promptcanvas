/**
 * PlatformCache provides a memory-backed caching layer with TTL support
 * and invalidation. Designed with a distributed cache interface boundary
 * for future Redis integration.
 */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms, 0 = no expiry
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class PlatformCache {
  private static instance: PlatformCache;
  private store: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  private constructor() {}

  public static getInstance(): PlatformCache {
    if (!PlatformCache.instance) {
      PlatformCache.instance = new PlatformCache();
    }
    return PlatformCache.instance;
  }

  public set<T>(key: string, value: T, ttlMs: number = 0): void {
    const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : 0;
    this.store.set(key, { value, expiresAt });
  }

  public get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value as T;
  }

  public invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public statistics(): CacheStatistics {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.store.size,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0
    };
  }

  public health(): { status: string; size: number } {
    return { status: "healthy", size: this.store.size };
  }
}
