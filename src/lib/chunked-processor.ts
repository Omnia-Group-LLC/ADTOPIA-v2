// Chunked processing utilities for handling large datasets efficiently

export interface ChunkProcessorOptions<T> {
  chunkSize: number;
  delay?: number;
  onProgress?: (processed: number, total: number) => void;
  onChunkComplete?: (chunkIndex: number, processedCount: number) => void;
  onError?: (error: Error, item: T, index: number) => void;
}

export interface ProcessingResult<T, R> {
  processed: R[];
  errors: Array<{ item: T; index: number; error: Error }>;
  totalProcessed: number;
  totalErrors: number;
}

/**
 * Process array of items in chunks with progress tracking
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: ChunkProcessorOptions<T>
): Promise<ProcessingResult<T, R>> {
  const {
    chunkSize,
    delay = 10,
    onProgress,
    onChunkComplete,
    onError
  } = options;

  const results: R[] = [];
  const errors: Array<{ item: T; index: number; error: Error }> = [];
  let processedCount = 0;

  // Process items in chunks
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize);
    let chunkProcessedCount = 0;

    // Process chunk items
    for (let j = 0; j < chunk.length; j++) {
      const item = chunk[j];
      const globalIndex = i + j;

      try {
        const result = await processor(item, globalIndex);
        results.push(result);
        processedCount++;
        chunkProcessedCount++;
        
        onProgress?.(processedCount, items.length);
      } catch (error) {
        const errorInfo = { 
          item, 
          index: globalIndex, 
          error: error instanceof Error ? error : new Error(String(error))
        };
        errors.push(errorInfo);
        onError?.(errorInfo.error, item, globalIndex);
      }
    }

    onChunkComplete?.(chunkIndex, chunkProcessedCount);

    // Add delay between chunks to prevent blocking
    if (delay > 0 && i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    processed: results,
    errors,
    totalProcessed: processedCount,
    totalErrors: errors.length
  };
}

/**
 * Process files in chunks with compression
 */
export async function processFilesInChunks(
  files: File[],
  processor: (file: File) => Promise<{ compressed: string; thumbnail?: string }>,
  options: Omit<ChunkProcessorOptions<File>, 'onChunkComplete'> & {
    onChunkComplete?: (chunkIndex: number, processedCount: number) => void;
  }
): Promise<ProcessingResult<File, { compressed: string; thumbnail?: string }>> {
  return processInChunks(files, processor, {
    ...options,
    onChunkComplete: (chunkIndex, processedCount) => {
      console.log(`Completed chunk ${chunkIndex + 1}, processed ${processedCount} files`);
      options.onChunkComplete?.(chunkIndex, processedCount);
    }
  });
}

/**
 * Parse CSV in chunks to handle large files
 */
export async function parseCSVInChunks(
  csvText: string,
  processor: (row: string[], index: number, headers: string[]) => Promise<any>,
  options: ChunkProcessorOptions<string[]>
): Promise<ProcessingResult<string[], any>> {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dataLines = lines.slice(1);
  
  // Convert lines to arrays
  const rows = dataLines.map(line => 
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );

  return processInChunks(
    rows,
    (row, index) => processor(row, index, headers),
    options
  );
}

/**
 * Queue for managing concurrent operations
 */
export class ConcurrencyQueue<T> {
  private queue: Array<() => Promise<T>> = [];
  private running = 0;
  private maxConcurrency: number;

  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
  }

  async add<R>(task: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result as unknown as R);
          return result as unknown as T;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();

    if (task) {
      try {
        await task();
      } catch (error) {
        console.warn('Task failed:', error);
      } finally {
        this.running--;
        this.process(); // Process next task
      }
    }
  }

  get size(): number {
    return this.queue.length;
  }

  get isRunning(): boolean {
    return this.running > 0;
  }
}

/**
 * Utility for batching operations with automatic flushing
 */
export class BatchProcessor<T> {
  private batch: T[] = [];
  private processor: (batch: T[]) => Promise<void>;
  private batchSize: number;
  private timeout: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    processor: (batch: T[]) => Promise<void>,
    batchSize = 10,
    timeout = 1000
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.timeout = timeout;
  }

  add(item: T): void {
    this.batch.push(item);

    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Process if batch is full
    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else {
      // Set timer for timeout-based processing
      this.timer = setTimeout(() => this.flush(), this.timeout);
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const currentBatch = [...this.batch];
    this.batch = [];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      await this.processor(currentBatch);
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Could implement retry logic here
    }
  }

  get pendingCount(): number {
    return this.batch.length;
  }
}