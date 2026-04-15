/**
 * Metrics Service
 *
 * Tracks application metrics for monitoring and alerting.
 */

import { logger } from '../utils/logger';

interface MetricValue {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

interface MetricDefinition {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram';
}

/**
 * MetricsService - Collects and exports metrics
 */
export class MetricsService {
  private metrics: Map<string, MetricDefinition>;
  private values: Map<string, MetricValue[]>;
  private readonly maxDataPoints = 10000;

  constructor() {
    this.metrics = new Map();
    this.values = new Map();
    this.initializeDefaultMetrics();
  }

  /**
   * Initialize default application metrics
   */
  private initializeDefaultMetrics(): void {
    this.registerMetric({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      type: 'counter'
    });

    this.registerMetric({
      name: 'api_request_duration_ms',
      help: 'API request duration in milliseconds',
      type: 'histogram'
    });

    this.registerMetric({
      name: 'solana_rpc_calls_total',
      help: 'Total Solana RPC calls',
      type: 'counter'
    });

    this.registerMetric({
      name: 'active_traces',
      help: 'Number of active traces',
      type: 'gauge'
    });

    this.registerMetric({
      name: 'cache_hit_ratio',
      help: 'Cache hit ratio',
      type: 'gauge'
    });
  }

  /**
   * Register a new metric
   */
  registerMetric(definition: MetricDefinition): void {
    this.metrics.set(definition.name, definition);
    if (!this.values.has(definition.name)) {
      this.values.set(definition.name, []);
    }
  }

  /**
   * Increment counter metric
   */
  increment(name: string, labels?: Record<string, string>, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'counter') {
      logger.warn(`Counter metric ${name} not found`);
      return;
    }

    const values = this.values.get(name) || [];
    values.push({
      timestamp: Date.now(),
      value,
      labels
    });

    this.trimOldData(values);
    this.values.set(name, values);
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'gauge') {
      logger.warn(`Gauge metric ${name} not found`);
      return;
    }

    const values = this.values.get(name) || [];
    values.push({
      timestamp: Date.now(),
      value,
      labels
    });

    this.trimOldData(values);
    this.values.set(name, values);
  }

  /**
   * Record histogram value
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'histogram') {
      logger.warn(`Histogram metric ${name} not found`);
      return;
    }

    const values = this.values.get(name) || [];
    values.push({
      timestamp: Date.now(),
      value,
      labels
    });

    this.trimOldData(values);
    this.values.set(name, values);
  }

  /**
   * Trim old data points
   */
  private trimOldData(values: MetricValue[]): void {
    if (values.length > this.maxDataPoints) {
      values.splice(0, values.length - this.maxDataPoints);
    }
  }

  /**
   * Get metric values
   */
  getValues(name: string): MetricValue[] {
    return this.values.get(name) || [];
  }

  /**
   * Get all metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    let output = '';

    for (const [name, definition] of this.metrics) {
      output += `# HELP ${name} ${definition.help}\n`;
      output += `# TYPE ${name} ${definition.type}\n`;

      const values = this.values.get(name) || [];
      const latest = values[values.length - 1];

      if (latest) {
        const labelStr = latest.labels
          ? Object.entries(latest.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(',')
          : '';

        if (labelStr) {
          output += `${name}{${labelStr}} ${latest.value}\n`;
        } else {
          output += `${name} ${latest.value}\n`;
        }
      }
    }

    return output;
  }

  /**
   * Get summary stats for metric
   */
  getStats(name: string): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } | null {
    const values = this.values.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const nums = values.map(v => v.value);
    const sum = nums.reduce((a, b) => a + b, 0);

    return {
      count: nums.length,
      sum,
      avg: sum / nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums)
    };
  }
}

// Global instance
export const metrics = new MetricsService();
export default MetricsService;
