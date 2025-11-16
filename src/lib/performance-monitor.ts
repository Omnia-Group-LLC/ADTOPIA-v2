// Performance monitoring utilities for AdTopia
// Tracks key metrics for optimization and debugging

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PageLoadMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  // Track custom business metrics
  public trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };
    
    this.metrics.push(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${name}`, metric);
    }
  }

  // Track API call performance
  public async trackAPICall<T>(
    name: string, 
    apiCall: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.trackMetric(`api.${name}`, duration, {
        status: 'success',
        ...metadata
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.trackMetric(`api.${name}`, duration, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata
      });
      
      throw error;
    }
  }

  // Track user interactions
  public trackUserAction(action: string, element?: string, metadata?: Record<string, any>): void {
    this.trackMetric(`user.${action}`, 1, {
      element,
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      timestamp: Date.now(),
      ...metadata
    });
  }

  // Track conversion funnel steps
  public trackConversion(step: string, metadata?: Record<string, any>): void {
    this.trackMetric(`conversion.${step}`, 1, {
      funnel: 'main',
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ...metadata
    });
  }

  // Track component render performance
  public trackRender(componentName: string, renderTime: number): void {
    this.trackMetric(`render.${componentName}`, renderTime, {
      type: 'component'
    });
  }

  // Get page load metrics
  public getPageLoadMetrics(): PageLoadMetrics | null {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;

    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
      firstInputDelay: this.getFirstInputDelay()
    };
  }

  // Initialize performance observers
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackMetric('web_vitals.lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID (First Input Delay)  
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as any;
            if (fidEntry.processingStart) {
              this.trackMetric('web_vitals.fid', fidEntry.processingStart - fidEntry.startTime);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS (Cumulative Layout Shift)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.trackMetric('web_vitals.cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  // Helper methods for specific metrics
  private getFirstContentfulPaint(): number {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  private getLargestContentfulPaint(): number | undefined {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    return entries.length > 0 ? entries[entries.length - 1].startTime : undefined;
  }

  private getCumulativeLayoutShift(): number | undefined {
    let clsValue = 0;
    const entries = performance.getEntriesByType('layout-shift') as any[];
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    return clsValue > 0 ? clsValue : undefined;
  }

  private getFirstInputDelay(): number | undefined {
    const entries = performance.getEntriesByType('first-input');
    if (entries.length > 0) {
      const entry = entries[0] as any;
      return entry.processingStart ? entry.processingStart - entry.startTime : undefined;
    }
    return undefined;
  }

  // Get all tracked metrics
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by name pattern
  public getMetricsByName(pattern: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name.includes(pattern));
  }

  // Clear metrics (useful for testing)
  public clearMetrics(): void {
    this.metrics = [];
  }

  // Cleanup observers
  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const trackRender = (startTime: number) => {
    const renderTime = performance.now() - startTime;
    performanceMonitor.trackRender(componentName, renderTime);
  };

  const trackUserAction = (action: string, metadata?: Record<string, any>) => {
    performanceMonitor.trackUserAction(action, componentName, metadata);
  };

  const trackAPICall = <T>(name: string, apiCall: () => Promise<T>) => {
    return performanceMonitor.trackAPICall(name, apiCall, { component: componentName });
  };

  return {
    trackRender,
    trackUserAction,
    trackAPICall,
    trackConversion: performanceMonitor.trackConversion.bind(performanceMonitor)
  };
}

// Business metrics helpers
export const BusinessMetrics = {
  // Track pricing page interactions
  trackPricingInteraction: (tier: string, action: 'view' | 'click' | 'convert') => {
    performanceMonitor.trackConversion(`pricing.${action}`, { tier });
  },

  // Track analytics generation
  trackAnalyticsGeneration: (type: string, success: boolean, duration?: number) => {
    performanceMonitor.trackMetric('analytics.generation', duration || 0, {
      type,
      success,
      timestamp: Date.now()
    });
  },

  // Track user onboarding steps
  trackOnboardingStep: (step: string, completed: boolean) => {
    performanceMonitor.trackConversion(`onboarding.${step}`, { completed });
  },

  // Track subscription actions
  trackSubscriptionAction: (action: 'upgrade' | 'downgrade' | 'cancel' | 'renew', tier?: string) => {
    performanceMonitor.trackMetric(`subscription.${action}`, 1, { tier });
  }
};

export default performanceMonitor;