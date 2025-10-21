import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly notesRequestsTotal: Counter<string>;
  private readonly cacheHitsTotal: Counter<string>;
  private readonly cacheMissesTotal: Counter<string>;
  private readonly notesRequestDuration: Histogram<string>;

  constructor() {
    // Initialize default metrics
    collectDefaultMetrics({ register });

    // Custom metrics
    this.notesRequestsTotal = new Counter({
      name: 'notes_requests_total',
      help: 'Total number of notes requests',
      labelNames: ['method', 'endpoint'],
    });

    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
    });

    this.notesRequestDuration = new Histogram({
      name: 'notes_request_duration_seconds',
      help: 'Duration of notes requests in seconds',
      labelNames: ['method', 'endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    register.registerMetric(this.notesRequestsTotal);
    register.registerMetric(this.cacheHitsTotal);
    register.registerMetric(this.cacheMissesTotal);
    register.registerMetric(this.notesRequestDuration);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  incrementNotesRequests(method: string, endpoint: string): void {
    this.notesRequestsTotal.inc({ method, endpoint });
  }

  incrementCacheHits(cacheType: string): void {
    this.cacheHitsTotal.inc({ cache_type: cacheType });
  }

  incrementCacheMisses(cacheType: string): void {
    this.cacheMissesTotal.inc({ cache_type: cacheType });
  }

  recordNotesRequestDuration(method: string, endpoint: string, duration: number): void {
    this.notesRequestDuration.observe({ method, endpoint }, duration);
  }
}
