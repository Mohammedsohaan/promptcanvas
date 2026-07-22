/**
 * PlatformTelemetryService measures internal platform operations such as
 * plugin load times, registry lookups, event dispatch latency, and
 * analysis durations.
 */
export interface TelemetryEntry {
  operation: string;
  durationMs: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PlatformTelemetryService {
  private static instance: PlatformTelemetryService;
  private entries: TelemetryEntry[] = [];

  private constructor() {}

  public static getInstance(): PlatformTelemetryService {
    if (!PlatformTelemetryService.instance) {
      PlatformTelemetryService.instance = new PlatformTelemetryService();
    }
    return PlatformTelemetryService.instance;
  }

  public measure<T>(operation: string, fn: () => T, metadata?: Record<string, any>): T {
    const start = Date.now();
    const result = fn();
    const durationMs = Date.now() - start;
    this.entries.push({ operation, durationMs, timestamp: start, metadata });
    return result;
  }

  public async measureAsync<T>(operation: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const durationMs = Date.now() - start;
    this.entries.push({ operation, durationMs, timestamp: start, metadata });
    return result;
  }

  public record(operation: string, durationMs: number, metadata?: Record<string, any>): void {
    this.entries.push({ operation, durationMs, timestamp: Date.now(), metadata });
  }

  public getEntries(): TelemetryEntry[] {
    return [...this.entries];
  }

  public getEntriesByOperation(operation: string): TelemetryEntry[] {
    return this.entries.filter(e => e.operation === operation);
  }

  public getAverageDuration(operation: string): number {
    const ops = this.getEntriesByOperation(operation);
    if (ops.length === 0) return 0;
    return ops.reduce((a, b) => a + b.durationMs, 0) / ops.length;
  }

  public summary(): Record<string, { count: number; avgMs: number; maxMs: number }> {
    const ops = new Map<string, number[]>();
    for (const entry of this.entries) {
      if (!ops.has(entry.operation)) ops.set(entry.operation, []);
      ops.get(entry.operation)!.push(entry.durationMs);
    }

    const result: Record<string, { count: number; avgMs: number; maxMs: number }> = {};
    for (const [op, durations] of ops.entries()) {
      result[op] = {
        count: durations.length,
        avgMs: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxMs: Math.max(...durations)
      };
    }
    return result;
  }

  public clear(): void {
    this.entries = [];
  }

  public health(): { status: string; totalEntries: number } {
    return { status: "healthy", totalEntries: this.entries.length };
  }
}
