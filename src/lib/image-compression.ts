// Image compression and optimization utilities
// Note: @huggingface/transformers is dynamically imported only when removeBackground is called
// to avoid bundling the 21MB WASM file in the main bundle

const MAX_IMAGE_DIMENSION = 1024;
const COMPRESSION_QUALITY = 0.8;
const THUMBNAIL_SIZE = 300;

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  generateThumbnail?: boolean;
}

export interface CompressedImage {
  original: string;
  compressed: string;
  thumbnail?: string;
  size: {
    original: number;
    compressed: number;
    thumbnail?: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Compress an image with various optimization options
 */
export async function compressImage(
  dataUrl: string, 
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const {
    maxWidth = MAX_IMAGE_DIMENSION,
    maxHeight = MAX_IMAGE_DIMENSION,
    quality = COMPRESSION_QUALITY,
    format = 'webp',
    generateThumbnail = true
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error('Could not get canvas context');

        // Calculate new dimensions
        const { width, height } = calculateDimensions(
          img.naturalWidth, 
          img.naturalHeight, 
          maxWidth, 
          maxHeight
        );

        // Draw compressed image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Generate compressed version
        const mimeType = `image/${format}`;
        const compressed = canvas.toDataURL(mimeType, quality);

        // Calculate sizes
        const originalSize = Math.round((dataUrl.length * 3) / 4);
        const compressedSize = Math.round((compressed.length * 3) / 4);

        const result: CompressedImage = {
          original: dataUrl,
          compressed,
          size: {
            original: originalSize,
            compressed: compressedSize
          },
          dimensions: { width, height }
        };

        // Generate thumbnail if requested
        if (generateThumbnail) {
          const thumbDimensions = calculateDimensions(width, height, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
          const thumbCanvas = document.createElement('canvas');
          const thumbCtx = thumbCanvas.getContext('2d');
          
          if (thumbCtx) {
            thumbCanvas.width = thumbDimensions.width;
            thumbCanvas.height = thumbDimensions.height;
            thumbCtx.drawImage(canvas, 0, 0, thumbDimensions.width, thumbDimensions.height);
            
            const thumbnail = thumbCanvas.toDataURL('image/webp', 0.6);
            result.thumbnail = thumbnail;
            result.size.thumbnail = Math.round((thumbnail.length * 3) / 4);
          }
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Remove background from image using AI
 * Dynamically imports @huggingface/transformers to avoid bundling 21MB WASM in main bundle
 */
export async function removeBackground(imageElement: HTMLImageElement): Promise<Blob> {
  try {
    console.log('Starting background removal process...');
    // Dynamically import transformers only when this function is called
    const { pipeline, env } = await import('@huggingface/transformers');
    
    // Configure transformers.js
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    outputCtx.drawImage(canvas, 0, 0);
    
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;
    
    if (width > height) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    } else {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  return { width, height };
}

/**
 * Resize image if needed for AI processing
 */
function resizeImageIfNeeded(
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D, 
  image: HTMLImageElement
): boolean {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

/**
 * Load image from blob
 */
export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Check if an image file should be compressed based on size
 */
export function shouldCompressImage(file: File): boolean {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  return file.size > MAX_SIZE;
}

/**
 * Get file size estimation from data URL
 */
export function getFileSizeFromDataUrl(dataUrl: string): number {
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  return Math.round((base64Length * 3) / 4);
}