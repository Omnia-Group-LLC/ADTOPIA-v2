import type { ExportOptions, ExportPreset, FitMode } from "./export-presets";

export interface CanvasExportParams {
  imageDataUrl: string;
  preset: ExportPreset | null;
  options: ExportOptions;
  qrDataUrl?: string;
}

/**
 * Creates a canvas and exports an image with the specified dimensions and options
 */
export async function exportImageToCanvas({
  imageDataUrl,
  preset,
  options,
  qrDataUrl
}: CanvasExportParams): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Set canvas dimensions
    const width = preset?.width || 1080;
    const height = preset?.height || 1080;
    canvas.width = width;
    canvas.height = height;

    // Create image element
    const img = new Image();
    img.onload = () => {
      try {
        // Clear canvas with white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Calculate image positioning based on fit mode
        const drawParams = calculateImageFit(img, width, height, options.fitMode);
        
        // Draw the main image
        ctx.drawImage(
          img, 
          drawParams.sx, drawParams.sy, drawParams.sw, drawParams.sh,
          drawParams.dx, drawParams.dy, drawParams.dw, drawParams.dh
        );

        // Draw preview overlays if enabled
        if (options.previewMode) {
          drawPreviewOverlays(ctx, width, height, options);
        }

        // Add QR code if requested
        if (options.includeQR && qrDataUrl) {
          const qrImg = new Image();
          qrImg.onload = () => {
            drawQRWithLabel(ctx, qrImg, width, height, options);
            
            // Export final image
            const outputDataUrl = canvas.toDataURL(
              `image/${options.format}`,
              options.format === "png" ? undefined : options.quality
            );
            resolve(outputDataUrl);
          };
          qrImg.onerror = () => {
            // If QR fails, export without it
            finishExport();
          };
          qrImg.src = qrDataUrl;
        } else {
          finishExport();
        }

        function finishExport() {
          const outputDataUrl = canvas.toDataURL(
            `image/${options.format}`,
            options.format === "png" ? undefined : options.quality
          );
          resolve(outputDataUrl);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
}

interface ImageFitParams {
  sx: number; // source x
  sy: number; // source y  
  sw: number; // source width
  sh: number; // source height
  dx: number; // destination x
  dy: number; // destination y
  dw: number; // destination width
  dh: number; // destination height
}

/**
 * Calculate how to fit an image into target dimensions based on fit mode
 */
function calculateImageFit(
  img: HTMLImageElement, 
  targetWidth: number, 
  targetHeight: number, 
  fitMode: FitMode
): ImageFitParams {
  const imgRatio = img.width / img.height;
  const targetRatio = targetWidth / targetHeight;

  switch (fitMode) {
    case "cover": {
      // Scale to fill, crop if necessary
      if (imgRatio > targetRatio) {
        // Image is wider - crop width
        const scaledWidth = img.height * targetRatio;
        const cropX = (img.width - scaledWidth) / 2;
        return {
          sx: cropX, sy: 0, sw: scaledWidth, sh: img.height,
          dx: 0, dy: 0, dw: targetWidth, dh: targetHeight
        };
      } else {
        // Image is taller - crop height
        const scaledHeight = img.width / targetRatio;
        const cropY = (img.height - scaledHeight) / 2;
        return {
          sx: 0, sy: cropY, sw: img.width, sh: scaledHeight,
          dx: 0, dy: 0, dw: targetWidth, dh: targetHeight
        };
      }
    }

    case "contain": {
      // Scale to fit completely, add letterboxing
      if (imgRatio > targetRatio) {
        // Image is wider - fit to width
        const scaledHeight = targetWidth / imgRatio;
        const offsetY = (targetHeight - scaledHeight) / 2;
        return {
          sx: 0, sy: 0, sw: img.width, sh: img.height,
          dx: 0, dy: offsetY, dw: targetWidth, dh: scaledHeight
        };
      } else {
        // Image is taller - fit to height
        const scaledWidth = targetHeight * imgRatio;
        const offsetX = (targetWidth - scaledWidth) / 2;
        return {
          sx: 0, sy: 0, sw: img.width, sh: img.height,
          dx: offsetX, dy: 0, dw: scaledWidth, dh: targetHeight
        };
      }
    }

    case "fill":
    default: {
      // Stretch to fill exactly
      return {
        sx: 0, sy: 0, sw: img.width, sh: img.height,
        dx: 0, dy: 0, dw: targetWidth, dh: targetHeight
      };
    }
  }
}

/**
 * Draw preview overlays (watermarks and badges)
 */
function drawPreviewOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ExportOptions
): void {
  if (options.overlayType === "watermark" || options.overlayType === "both") {
    drawDiagonalWatermark(ctx, width, height, options.watermarkText, options.watermarkOpacity);
  }
  
  if (options.overlayType === "badge" || options.overlayType === "both") {
    drawCornerBadge(ctx, width, height, options.badgeText, options.badgePosition);
  }
}

/**
 * Draw diagonal watermark across the image
 */
function drawDiagonalWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  opacity: number
): void {
  ctx.save();
  
  // Set text properties
  const fontSize = Math.min(width, height) * 0.08; // 8% of smallest dimension
  ctx.font = `bold ${fontSize}px system-ui`;
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.textAlign = "center";
  
  // Move to center and rotate
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6); // -30 degrees
  
  // Draw the text
  ctx.fillText(text, 0, 0);
  
  ctx.restore();
}

/**
 * Draw corner badge
 */
function drawCornerBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  position: ExportOptions["badgePosition"]
): void {
  const padding = 8;
  const fontSize = Math.min(width, height) * 0.025; // 2.5% of smallest dimension
  ctx.font = `bold ${fontSize}px system-ui`;
  
  const textMetrics = ctx.measureText(text);
  const badgeWidth = textMetrics.width + padding * 2;
  const badgeHeight = fontSize + padding * 2;
  
  // Calculate position
  let x, y;
  switch (position) {
    case "top-left":
      x = 10; y = 10;
      break;
    case "top-right":
      x = width - badgeWidth - 10; y = 10;
      break;
    case "bottom-left":
      x = 10; y = height - badgeHeight - 10;
      break;
    case "bottom-right":
    default:
      x = width - badgeWidth - 10; y = height - badgeHeight - 10;
      break;
  }
  
  // Draw badge background
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(x, y, badgeWidth, badgeHeight);
  
  // Draw badge text
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(text, x + badgeWidth / 2, y + badgeHeight / 2 + fontSize * 0.35);
}

/**
 * Draw QR code with optional label
 */
function drawQRWithLabel(
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement,
  width: number,
  height: number,
  options: ExportOptions
): void {
  const qrSize = Math.floor(width * (options.qrSize / 100));
  const padding = 12;
  const labelHeight = options.qrLabel ? 20 : 0;
  const totalHeight = qrSize + labelHeight + (labelHeight ? 8 : 0); // 8px gap between QR and label
  
  const pos = calculateQRPosition(width, height, qrSize, totalHeight, options.qrPosition);
  
  // Draw background if enabled
  if (options.qrBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      pos.x - padding, 
      pos.y - padding, 
      qrSize + padding * 2, 
      totalHeight + padding * 2
    );
  }
  
  // Draw QR code
  ctx.drawImage(qrImg, pos.x, pos.y, qrSize, qrSize);
  
  // Draw label if provided
  if (options.qrLabel) {
    ctx.fillStyle = "#1f2937";
    ctx.font = `12px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(options.qrLabel, pos.x + qrSize / 2, pos.y + qrSize + 16);
  }
}

/**
 * Calculate QR code position (updated to account for label height)
 */
function calculateQRPosition(
  canvasWidth: number, 
  canvasHeight: number, 
  qrSize: number,
  totalHeight: number,
  position: ExportOptions["qrPosition"]
): { x: number; y: number } {
  const margin = 20;

  switch (position) {
    case "top-left":
      return { x: margin, y: margin };
    case "top-right":
      return { x: canvasWidth - qrSize - margin, y: margin };
    case "bottom-left":
      return { x: margin, y: canvasHeight - totalHeight - margin };
    case "bottom-right":
    default:
      return { x: canvasWidth - qrSize - margin, y: canvasHeight - totalHeight - margin };
  }
}