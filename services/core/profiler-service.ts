/**
 * ProfilerService measures platform-level performance characteristics:
 * bootstrap time, registry performance, plugin initialization, and
 * memory/CPU baselines.
 */
export interface ProfileSnapshot {
  bootstrapTimeMs: number;
  registryLookupAvgMs: number;
  pluginInitAvgMs: number;
  memoryUsageMB: number;
  pipelineDurationMs: number;
  timestamp: number;
}

export class ProfilerService {
  private static instance: ProfilerService;
  private snapshots: ProfileSnapshot[] = [];
  private timers: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ProfilerService {
    if (!ProfilerService.instance) {
      ProfilerService.instance = new ProfilerService();
    }
    return ProfilerService.instance;
  }

  public startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  public stopTimer(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;
    const elapsed = Date.now() - start;
    this.timers.delete(label);
    return elapsed;
  }

  public captureSnapshot(overrides: Partial<ProfileSnapshot> = {}): ProfileSnapshot {
    const snapshot: ProfileSnapshot = {
      bootstrapTimeMs: overrides.bootstrapTimeMs || 0,
      registryLookupAvgMs: overrides.registryLookupAvgMs || 0,
      pluginInitAvgMs: overrides.pluginInitAvgMs || 0,
      memoryUsageMB: overrides.memoryUsageMB || this.getMemoryUsageMB(),
      pipelineDurationMs: overrides.pipelineDurationMs || 0,
      timestamp: Date.now()
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  public getSnapshots(): ProfileSnapshot[] {
    return [...this.snapshots];
  }

  public getLatestSnapshot(): ProfileSnapshot | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  private getMemoryUsageMB(): number {
    // In Node.js this would use process.memoryUsage().heapUsed
    // In browser/test, return a safe default
    if (typeof process !== "undefined" && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
    return 0;
  }

  public generateBenchmark(): { snapshots: ProfileSnapshot[]; averageBootstrap: number; averageMemory: number } {
    const avgBoot = this.snapshots.length > 0
      ? this.snapshots.reduce((a, b) => a + b.bootstrapTimeMs, 0) / this.snapshots.length
      : 0;
    const avgMem = this.snapshots.length > 0
      ? this.snapshots.reduce((a, b) => a + b.memoryUsageMB, 0) / this.snapshots.length
      : 0;

    return { snapshots: [...this.snapshots], averageBootstrap: avgBoot, averageMemory: avgMem };
  }

  public clear(): void {
    this.snapshots = [];
    this.timers.clear();
  }

  public health(): { status: string; snapshotCount: number } {
    return { status: "healthy", snapshotCount: this.snapshots.length };
  }
}
