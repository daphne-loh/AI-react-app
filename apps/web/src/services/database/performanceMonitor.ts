import { auditLogger } from './auditLogger';
import { PerformanceMetric } from '@fooddrop/shared';

export interface QueryPerformanceConfig {
  warnThreshold: number; // milliseconds
  errorThreshold: number; // milliseconds
  enableLogging: boolean;
  enableMetrics: boolean;
}

export class DatabasePerformanceMonitor {
  private static config: QueryPerformanceConfig = {
    warnThreshold: 500, // 500ms
    errorThreshold: 2000, // 2 seconds
    enableLogging: true,
    enableMetrics: true
  };

  private static metrics: Map<string, PerformanceMetric[]> = new Map();

  static configure(config: Partial<QueryPerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // Performance Monitoring Wrapper
  // ============================================================================

  static async monitorQuery<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: {
      userId?: string;
      queryType?: 'read' | 'write' | 'delete';
      collection?: string;
      documentCount?: number;
      useCache?: boolean;
    }
  ): Promise<T> {
    const startTime = performance.now();
    let result: T;
    let error: Error | null = null;

    try {
      result = await operation();
      return result;
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      await this.recordMetric({
        operation: operationName,
        duration,
        userId: metadata?.userId,
        queryType: metadata?.queryType,
        collection: metadata?.collection,
        documentCount: metadata?.documentCount,
        cached: metadata?.useCache || false,
        errorCode: error ? error.name : undefined,
        timestamp: new Date()
      });

      // Log performance warnings
      if (this.config.enableLogging) {
        if (duration > this.config.errorThreshold) {
          console.error(`SLOW QUERY: ${operationName} took ${duration.toFixed(2)}ms`, {
            metadata,
            error: error?.message
          });
        } else if (duration > this.config.warnThreshold) {
          console.warn(`Slow query: ${operationName} took ${duration.toFixed(2)}ms`, metadata);
        }
      }
    }
  }

  // ============================================================================
  // Metrics Collection
  // ============================================================================

  static async recordMetric(metric: Omit<PerformanceMetric, 'id'>): Promise<void> {
    if (!this.config.enableMetrics) return;

    try {
      // Store in memory for immediate access
      const operationMetrics = this.metrics.get(metric.operation) || [];
      operationMetrics.push({
        ...metric,
        id: `${metric.operation}_${Date.now()}_${Math.random().toString(36).substring(7)}`
      });

      // Keep only last 100 metrics per operation to prevent memory leaks
      if (operationMetrics.length > 100) {
        operationMetrics.shift();
      }
      this.metrics.set(metric.operation, operationMetrics);

      // Log to audit system (async, don't block)
      if (process.env.NODE_ENV === 'production') {
        auditLogger.logPerformanceMetric(
          metric.operation,
          metric.duration,
          metric.userId,
          {
            queryType: metric.queryType,
            collection: metric.collection,
            documentCount: metric.documentCount,
            cached: metric.cached,
            errorCode: metric.errorCode
          }
        ).catch(error => {
          console.error('Failed to log performance metric:', error);
        });
      }

    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // ============================================================================
  // Performance Analysis
  // ============================================================================

  static getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    
    return Array.from(this.metrics.values()).flat();
  }

  static getAverageQueryTime(operation: string, timeWindow?: number): number {
    const operationMetrics = this.metrics.get(operation) || [];
    
    let metricsToAnalyze = operationMetrics;
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      metricsToAnalyze = operationMetrics.filter(m => m.timestamp.getTime() > cutoff);
    }

    if (metricsToAnalyze.length === 0) return 0;

    const totalTime = metricsToAnalyze.reduce((sum, metric) => sum + metric.duration, 0);
    return totalTime / metricsToAnalyze.length;
  }

  static getSlowQueries(threshold?: number): PerformanceMetric[] {
    const slowThreshold = threshold || this.config.warnThreshold;
    return this.getMetrics().filter(metric => metric.duration > slowThreshold);
  }

  static getPerformanceReport(): {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
    errorRate: number;
    topSlowOperations: Array<{ operation: string; avgDuration: number; count: number }>;
  } {
    const allMetrics = this.getMetrics();
    const totalQueries = allMetrics.length;
    
    if (totalQueries === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        errorRate: 0,
        topSlowOperations: []
      };
    }

    const totalTime = allMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageQueryTime = totalTime / totalQueries;
    
    const slowQueries = allMetrics.filter(m => m.duration > this.config.warnThreshold).length;
    const errorsCount = allMetrics.filter(m => m.errorCode).length;
    const errorRate = (errorsCount / totalQueries) * 100;

    // Calculate top slow operations
    const operationStats = new Map<string, { totalDuration: number; count: number }>();
    
    allMetrics.forEach(metric => {
      const stats = operationStats.get(metric.operation) || { totalDuration: 0, count: 0 };
      stats.totalDuration += metric.duration;
      stats.count += 1;
      operationStats.set(metric.operation, stats);
    });

    const topSlowOperations = Array.from(operationStats.entries())
      .map(([operation, stats]) => ({
        operation,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    return {
      totalQueries,
      averageQueryTime,
      slowQueries,
      errorRate,
      topSlowOperations
    };
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  static clearMetrics(): void {
    this.metrics.clear();
  }

  static removeOldMetrics(olderThanMs: number): void {
    const cutoff = Date.now() - olderThanMs;
    
    this.metrics.forEach((metrics, operation) => {
      const filteredMetrics = metrics.filter(m => m.timestamp.getTime() > cutoff);
      if (filteredMetrics.length > 0) {
        this.metrics.set(operation, filteredMetrics);
      } else {
        this.metrics.delete(operation);
      }
    });
  }

  // ============================================================================
  // Query Optimization Helpers
  // ============================================================================

  static createOptimizedQuery = {
    // Helper for paginated queries
    paginated: <T>(
      queryFn: (limit: number, startAfter?: any) => Promise<T[]>,
      pageSize: number = 25
    ) => {
      return (page: number = 1, startAfter?: any) => 
        this.monitorQuery(
          `paginated_query_page_${page}`,
          () => queryFn(pageSize, startAfter),
          { queryType: 'read', documentCount: pageSize }
        );
    },

    // Helper for cached queries
    cached: <T>(
      cacheKey: string,
      queryFn: () => Promise<T>,
      ttlMs: number = 300000 // 5 minutes
    ) => {
      const cache = new Map<string, { data: T; expires: number }>();
      
      return async (): Promise<T> => {
        const cached = cache.get(cacheKey);
        const now = Date.now();

        if (cached && cached.expires > now) {
          return this.monitorQuery(
            `cached_query_${cacheKey}`,
            () => Promise.resolve(cached.data),
            { queryType: 'read', useCache: true }
          );
        }

        const result = await this.monitorQuery(
          `uncached_query_${cacheKey}`,
          queryFn,
          { queryType: 'read', useCache: false }
        );

        cache.set(cacheKey, { data: result, expires: now + ttlMs });
        return result;
      };
    },

    // Helper for batch operations
    batched: <T>(
      items: T[],
      batchFn: (batch: T[]) => Promise<void>,
      batchSize: number = 10
    ) => {
      return this.monitorQuery(
        `batched_operation_${items.length}_items`,
        async () => {
          const batches = [];
          for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
          }

          await Promise.all(batches.map(batch => batchFn(batch)));
        },
        { queryType: 'write', documentCount: items.length }
      );
    }
  };
}

// Export singleton and helpers
export const performanceMonitor = DatabasePerformanceMonitor;
export const monitorQuery = DatabasePerformanceMonitor.monitorQuery.bind(DatabasePerformanceMonitor);

// Helper function for compatibility with existing code
export const logPerformance = async (metric: {
  operation: string;
  duration: number;
  documentCount?: number;
  cached?: boolean;
  errorCode?: string;
  userId?: string;
  endpoint?: string;
  queryType?: string;
}): Promise<void> => {
  await DatabasePerformanceMonitor.recordMetric({
    id: `${metric.operation}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    operation: metric.operation,
    duration: metric.duration,
    timestamp: new Date(),
    userId: metric.userId,
    endpoint: metric.endpoint,
    queryType: metric.queryType,
    documentCount: metric.documentCount,
    errorCode: metric.errorCode,
    cached: metric.cached || false
  });
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Clean up old metrics every 30 minutes
  setInterval(() => {
    performanceMonitor.removeOldMetrics(30 * 60 * 1000); // 30 minutes
  }, 30 * 60 * 1000);

  // Log performance report every 10 minutes in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const report = performanceMonitor.getPerformanceReport();
      if (report.totalQueries > 0) {
        console.log('Database Performance Report:', report);
      }
    }, 10 * 60 * 1000);
  }
}