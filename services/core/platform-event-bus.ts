import { EventEmitter } from "events";

export type EventCallback = (payload: any) => void;

/**
 * PlatformEventBus is the central abstraction for all event-driven architecture.
 * It hides the internal EventEmitter so it can be swapped for Redis/Kafka in the future.
 */
export class PlatformEventBus {
  private static instance: PlatformEventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): PlatformEventBus {
    if (!PlatformEventBus.instance) {
      PlatformEventBus.instance = new PlatformEventBus();
    }
    return PlatformEventBus.instance;
  }

  public publish(event: string, payload?: any): void {
    this.emitter.emit(event, payload);
  }

  public subscribe(event: string, callback: EventCallback): void {
    this.emitter.on(event, callback);
  }

  public unsubscribe(event: string, callback: EventCallback): void {
    this.emitter.off(event, callback);
  }

  public clearAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}
