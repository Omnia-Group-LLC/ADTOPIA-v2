export type ExportFormat = "png" | "jpeg" | "webp";
export type FitMode = "cover" | "contain" | "fill";

export interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: string;
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0.1 to 1.0 for jpeg/webp
  fitMode: FitMode;
  includeQR: boolean;
  qrSize: number; // percentage of image width
  qrPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  qrLabel?: string; // optional label below QR
  qrBackground: boolean; // white background for QR
  previewMode: boolean; // enables watermark/badge overlays
  watermarkText: string; // diagonal watermark text
  watermarkOpacity: number; // 0.05 to 0.3
  badgeText: string; // corner badge text
  badgePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  overlayType: "watermark" | "badge" | "both";
}

export const EXPORT_PRESETS: ExportPreset[] = [
  // Instagram
  { id: "ig-feed", name: "Instagram Feed", width: 1080, height: 1080, platform: "Instagram", description: "Square posts" },
  { id: "ig-story", name: "Instagram Story", width: 1080, height: 1920, platform: "Instagram", description: "Vertical stories" },
  { id: "ig-reel", name: "Instagram Reel", width: 1080, height: 1920, platform: "Instagram", description: "Vertical video cover" },
  
  // Facebook
  { id: "fb-feed", name: "Facebook Feed", width: 1200, height: 630, platform: "Facebook", description: "Link preview" },
  { id: "fb-story", name: "Facebook Story", width: 1080, height: 1920, platform: "Facebook", description: "Vertical stories" },
  { id: "fb-cover", name: "Facebook Cover", width: 1200, height: 315, platform: "Facebook", description: "Page cover photo" },
  
  // Twitter/X
  { id: "x-post", name: "X (Twitter) Post", width: 1200, height: 675, platform: "X", description: "Tweet image" },
  { id: "x-header", name: "X (Twitter) Header", width: 1500, height: 500, platform: "X", description: "Profile header" },
  
  // YouTube
  { id: "yt-thumbnail", name: "YouTube Thumbnail", width: 1280, height: 720, platform: "YouTube", description: "Video thumbnail" },
  { id: "yt-banner", name: "YouTube Banner", width: 2560, height: 1440, platform: "YouTube", description: "Channel banner" },
  
  // TikTok
  { id: "tiktok-video", name: "TikTok Video", width: 1080, height: 1920, platform: "TikTok", description: "Vertical video cover" },
  
  // Service Ads
  { id: "service-square", name: "Service Ad Square", width: 1080, height: 1080, platform: "Service", description: "Perfect for service ads" },
  
  // LinkedIn
  { id: "li-post", name: "LinkedIn Post", width: 1200, height: 627, platform: "LinkedIn", description: "Link preview" },
  { id: "li-banner", name: "LinkedIn Banner", width: 1584, height: 396, platform: "LinkedIn", description: "Profile banner" },
  
  // General/Print
  { id: "print-a4", name: "Print A4", width: 2480, height: 3508, platform: "Print", description: "300 DPI A4" },
  { id: "print-flyer", name: "Print Flyer", width: 1275, height: 1650, platform: "Print", description: "5x6.5 inch flyer" },
  { id: "web-banner", name: "Web Banner", width: 728, height: 90, platform: "Web", description: "Leaderboard banner" },
];

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: "png",
  quality: 0.9,
  fitMode: "cover",
  includeQR: false,
  qrSize: 15, // 15% of image width
  qrPosition: "top-right",
  qrLabel: "Scan for details",
  qrBackground: true,
  previewMode: true,
  watermarkText: "Preview — se quita al comprar",
  watermarkOpacity: 0.08,
  badgeText: "PREVIEW",
  badgePosition: "top-left",
  overlayType: "watermark",
};

export function getFormatMimeType(format: ExportFormat): string {
  switch (format) {
    case "png": return "image/png";
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    default: return "image/png";
  }
}

export function buildExportFilename(
  cardTitle: string, 
  preset: ExportPreset | null, 
  format: ExportFormat
): string {
  const baseSlug = cardTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const presetSuffix = preset ? `-${preset.id}` : "";
  return `${baseSlug}${presetSuffix}.${format}`;
}