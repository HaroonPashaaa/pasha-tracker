/**
 * Metrics Service
 * 
 * Prometheus metrics collection and reporting.
 */

import { Counter, Histogram, Gauge, Registry } from 'prom-client';
import { logger } from '../utils/logger';

class MetricsService {
  private register: Registry;
  
  // API metrics
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private httpRequestErrors: Counter;
  
  // Blockchain metrics
  private solanaRpcCalls: Counter;
  private solanaRpcErrors: Counter;
  private solanaRpcDuration: Histogram;
  
  // Tracing metrics
  private tracesCompleted: Counter;
  private tracesFailed: Counter;
  private traceDepth: Histogram;
  
  // System metrics
  private activeConnections: Gauge;
  private queueSize: Gauge;

  constructor() {
    this.register = new Registry();
    
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // HTTP requests
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register]
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register]
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.register]
    });

    // Solana RPC metrics
    this.solanaRpcCalls = new Counter({
      name: 'solana_rpc_calls_total',
      help: 'Total Solana RPC calls',
      labelNames: ['method'],
      registers: [this.register]
    });

    this.solanaRpcErrors = new Counter({
      name: 'solana_rpc_errors_total',
      help: 'Total Solana RPC errors',
      labelNames: ['method', 'error_type'],
      registers: [this.register]
    });

    this.solanaRpcDuration = new Histogram({
      name: 'solana_rpc_duration_seconds',
      help: 'Solana RPC call duration',
      labelNames: ['method'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register]
    });

    // Tracing metrics
    this.tracesCompleted = new Counter({
      name: 'traces_completed_total',
      help: 'Total completed traces',
      labelNames: ['trace_type'],
      registers: [this.register]
    });

    this.tracesFailed = new Counter({
      name: 'traces_failed_total',
      help: 'Total failed traces',
      labelNames: ['trace_type', 'error_type'],
      registers: [this.register]
    });

    this.traceDepth = new Histogram({
      name: 'trace_depth',
      help: 'Depth of traces',
      buckets: [1, 2, 3, 5, 10, 15, 20],
      registers: [this.register]
    });

    // System metrics
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.register]
    });

    this.queueSize = new Gauge({
      name: 'queue_size',
      help: 'Current queue size',
      labelNames: ['queue_name'],
      registers: [this.register]
    });
  }

  // HTTP metrics
  recordHttpRequest(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  recordHttpDuration(method: string, route: string, duration: number): void {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  recordHttpError(method: string, route: string, errorType: string): void {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  // Solana RPC metrics
  recordSolanaRpcCall(method: string): void {
    this.solanaRpcCalls.inc({ method });
  }

  recordSolanaRpcError(method: string, errorType: string): void {
    this.solanaRpcErrors.inc({ method, error_type: errorType });
  }

  recordSolanaRpcDuration(method: string, duration: number): void {
    this.solanaRpcDuration.observe({ method }, duration);
  }

  // Tracing metrics
  recordTraceCompleted(traceType: string): void {
    this.tracesCompleted.inc({ trace_type: traceType });
  }

  recordTraceFailed(traceType: string, errorType: string): void {
    this.tracesFailed.inc({ trace_type: traceType, error_type: errorType });
  }

  recordTraceDepth(depth: number): void {
    this.traceDepth.observe(depth);
  }

  // System metrics
  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  setQueueSize(queueName: string, size: number): void {
    this.queueSize.set({ queue_name: queueName }, size);
  }

  // Get metrics for scraping
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Get register for custom metrics
  getRegister(): Registry {
    return this.register;
  }
}

export const metrics = new MetricsService();
export default metrics;
