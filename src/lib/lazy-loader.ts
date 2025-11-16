// Lazy loading utilities with intersection observer and caching

export interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  placeholder?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface LazyImageData {
  src: string;
  thumbnail?: string;
  loaded: boolean;
  loading: boolean;
  error?: string;
  retryCount: number;
}

/**
 * Lazy loading manager using Intersection Observer
 */
export class LazyLoader {
  private observer: IntersectionObserver;
  private cache = new Map<string, LazyImageData>();
  private options: Required<LazyLoadOptions>;

  constructor(options: LazyLoadOptions = {}) {
    this.options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
      placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280"%3ELoading...%3C/text%3E%3C/svg%3E',
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
  }

  /**
   * Register an element for lazy loading
   */
  observe(element: HTMLImageElement, src: string, thumbnail?: string): void {
    const imageData: LazyImageData = {
      src,
      thumbnail,
      loaded: false,
      loading: false,
      retryCount: 0
    };

    this.cache.set(src, imageData);
    element.dataset.src = src;
    element.dataset.thumbnail = thumbnail;
    
    // Set placeholder
    element.src = thumbnail || this.options.placeholder;
    
    this.observer.observe(element);
  }

  /**
   * Unobserve an element
   */
  unobserve(element: HTMLImageElement): void {
    this.observer.unobserve(element);
    
    const src = element.dataset.src;
    if (src) {
      this.cache.delete(src);
    }
  }

  /**
   * Handle intersection events
   */
  private async handleIntersection(entries: IntersectionObserverEntry[]): Promise<void> {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          await this.loadImage(img, src);
          this.observer.unobserve(img);
        }
      }
    }
  }

  /**
   * Load image with retry logic
   */
  private async loadImage(img: HTMLImageElement, src: string): Promise<void> {
    const imageData = this.cache.get(src);
    if (!imageData || imageData.loaded || imageData.loading) {
      return;
    }

    imageData.loading = true;
    this.cache.set(src, imageData);

    try {
      await this.preloadImage(src);
      
      // Success - update image
      img.src = src;
      img.classList.add('lazy-loaded');
      
      imageData.loaded = true;
      imageData.loading = false;
      imageData.error = undefined;
      
    } catch (error) {
      imageData.loading = false;
      imageData.error = error instanceof Error ? error.message : 'Load failed';
      imageData.retryCount++;

      // Retry logic
      if (imageData.retryCount < this.options.retryAttempts) {
        setTimeout(() => {
          this.loadImage(img, src);
        }, this.options.retryDelay * imageData.retryCount);
      } else {
        // Max retries reached - show error placeholder
        img.src = this.generateErrorPlaceholder();
        img.classList.add('lazy-error');
      }
    }

    this.cache.set(src, imageData);
  }

  /**
   * Preload an image
   */
  private preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  /**
   * Generate error placeholder
   */
  private generateErrorPlaceholder(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23fee2e2"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23dc2626"%3EFailed to load%3C/text%3E%3C/svg%3E';
  }

  /**
   * Get loading state for a source
   */
  getImageData(src: string): LazyImageData | undefined {
    return this.cache.get(src);
  }

  /**
   * Preload multiple images
   */
  async preloadImages(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src).catch(() => {}));
    await Promise.allSettled(promises);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Destroy the lazy loader
   */
  destroy(): void {
    this.observer.disconnect();
    this.cache.clear();
  }
}

/**
 * Progressive image loader with quality levels
 */
export class ProgressiveImageLoader {
  private cache = new Map<string, HTMLImageElement[]>();

  /**
   * Load image progressively from low to high quality
   */
  async loadProgressive(
    element: HTMLImageElement,
    sources: { thumbnail?: string; medium?: string; full: string }
  ): Promise<void> {
    const { thumbnail, medium, full } = sources;
    const cacheKey = full;

    // Show thumbnail immediately if available
    if (thumbnail) {
      element.src = thumbnail;
      element.classList.add('progressive-thumbnail');
    }

    try {
      // Load medium quality first
      if (medium) {
        await this.preloadAndSwap(element, medium, 'progressive-medium');
      }

      // Load full quality
      await this.preloadAndSwap(element, full, 'progressive-full');
      
    } catch (error) {
      console.warn('Progressive loading failed:', error);
      // Fallback to direct loading
      element.src = full;
    }
  }

  /**
   * Preload image and swap when ready
   */
  private async preloadAndSwap(
    element: HTMLImageElement,
    src: string,
    className: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        element.src = src;
        element.className = element.className.replace(/progressive-\w+/g, '');
        element.classList.add(className);
        resolve();
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }
}

/**
 * Virtual scrolling helper for large lists
 */
export class VirtualScrollManager {
  private container: HTMLElement;
  private itemHeight: number;
  private buffer: number;
  private visibleRange = { start: 0, end: 0 };

  constructor(container: HTMLElement, itemHeight: number, buffer = 5) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }

  /**
   * Calculate visible range based on scroll position
   */
  calculateVisibleRange(totalItems: number): { start: number; end: number } {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const end = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
    );

    this.visibleRange = { start, end };
    return this.visibleRange;
  }

  /**
   * Get current visible range
   */
  getVisibleRange(): { start: number; end: number } {
    return this.visibleRange;
  }

  /**
   * Calculate total height for virtual scrolling
   */
  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }

  /**
   * Calculate offset for item at index
   */
  getItemOffset(index: number): number {
    return index * this.itemHeight;
  }
}