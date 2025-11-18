# Image Optimization System

## Overview

The image optimization system automatically generates WebP versions and multiple sizes (thumbnail, medium, full) when images are uploaded to Supabase Storage buckets.

## Features

- **Automatic WebP Conversion**: All images are converted to WebP format for better compression
- **Multiple Sizes**: Creates 3 versions of each image:
  - **Thumbnail**: 400x300px @ 80% quality
  - **Medium**: 800x600px @ 85% quality  
  - **Full**: 1920x1440px @ 90% quality
- **Background Processing**: Optimization happens asynchronously without blocking uploads
- **Organized Storage**: Optimized images are stored in `optimized/` subfolder

## How It Works

### 1. Upload Flow

```typescript
// User uploads image via FileUploader component
const { uploadFile } = useFileUpload({ bucketName: 'ad-images' });
await uploadFile(file, userId);

// ↓ Upload completes
// ↓ Original image saved to: /user-id/timestamp-filename.jpg
// ↓ Optimization triggered automatically
// ↓ Creates 3 WebP versions in: /user-id/optimized/
```

### 2. Edge Functions

**`optimize-image`**: Main optimization function
- Accepts: `{ bucket, filePath, userId }`
- Downloads original image from storage
- Creates 3 WebP versions (thumbnail, medium, full)
- Uploads optimized versions to `optimized/` subfolder
- Returns URLs of all optimized versions

**`optimize-image-webhook`**: Webhook listener (optional)
- Triggered by storage events
- Filters for image files only
- Skips already-optimized images
- Calls `optimize-image` in background

### 3. Integration

The `useFileUpload` hook automatically triggers optimization:

```typescript
// After successful upload
await supabase.functions.invoke('optimize-image', {
  body: { bucket: bucketName, filePath: data.path, userId }
});
```

## Using Optimized Images

### Access URLs

After optimization, you'll have multiple versions available:

```typescript
// Original
https://project.supabase.co/storage/v1/object/public/ad-images/user-123/photo.jpg

// Optimized versions
https://project.supabase.co/storage/v1/object/public/ad-images/user-123/optimized/photo-thumbnail.webp
https://project.supabase.co/storage/v1/object/public/ad-images/user-123/optimized/photo-medium.webp
https://project.supabase.co/storage/v1/object/public/ad-images/user-123/optimized/photo-full.webp
```

### Responsive Images

Use `srcset` for automatic size selection:

```jsx
<img
  src="photo-medium.webp"
  srcset="
    photo-thumbnail.webp 400w,
    photo-medium.webp 800w,
    photo-full.webp 1920w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1920px"
  alt="Optimized image"
/>
```

### Picture Element with Fallback

```jsx
<picture>
  <source type="image/webp" srcset="photo-medium.webp" />
  <img src="photo.jpg" alt="Image with fallback" />
</picture>
```

## Performance Benefits

- **60-80% file size reduction** with WebP
- **Faster page loads** with appropriately-sized images
- **Reduced bandwidth costs** 
- **Better mobile experience** with smaller thumbnails
- **CDN-friendly** with cached optimized versions

## Manual Optimization

You can also trigger optimization manually:

```typescript
const { data, error } = await supabase.functions.invoke('optimize-image', {
  body: {
    bucket: 'ad-images',
    filePath: 'user-123/photo.jpg',
    userId: 'user-123'
  }
});

console.log('Optimized versions:', data.optimized);
// [
//   { name: 'thumbnail', url: '...', path: '...' },
//   { name: 'medium', url: '...', path: '...' },
//   { name: 'full', url: '...', path: '...' }
// ]
```

## Monitoring

Check edge function logs to monitor optimization:

```bash
# View logs in Supabase Dashboard
Project > Edge Functions > optimize-image > Logs
```

Look for:
- "Optimizing image" - Start of process
- "Downloaded original image, size: X" - Original file size
- "Processing thumbnail/medium/full version..." - Each size being created
- "Successfully created X versions" - Completion

## Troubleshooting

### Images not optimizing?

1. Check edge function logs for errors
2. Verify storage bucket permissions
3. Ensure file is an image (.jpg, .png, .webp, .gif)
4. Check that file isn't already in `/optimized/` folder

### Optimization fails?

The current implementation uses a basic approach. For production:

**Option 1: Use Cloudinary**

```typescript
// Upload to Cloudinary for automatic optimization
const cloudinaryUrl = `https://res.cloudinary.com/${cloud}/image/upload/w_800,q_auto,f_auto/${id}`;
```

**Option 2: Use imgix**

```typescript
// Use imgix URL parameters
const imgixUrl = `https://yourdomain.imgix.net/photo.jpg?w=800&auto=format,compress`;
```

**Option 3: Use Sharp via API**

Set up a separate image processing service with Sharp.

## Future Enhancements

- Add AVIF format support
- Implement smart cropping
- Add lazy loading placeholders (LQIP)
- Store optimization metadata in database
- Add admin dashboard for optimization stats
- Implement image compression quality presets
- Add support for animated images (GIF → WebP)
- Batch optimization for existing images

## Storage Structure

```
bucket-name/
├── user-id/
│   ├── original-image.jpg          (original upload)
│   ├── another-image.png           (original upload)
│   └── optimized/
│       ├── original-image-thumbnail.webp
│       ├── original-image-medium.webp
│       ├── original-image-full.webp
│       ├── another-image-thumbnail.webp
│       ├── another-image-medium.webp
│       └── another-image-full.webp
```

## Cost Considerations

- **Storage**: ~4x original size (original + 3 optimized versions)
- **Edge Function Invocations**: 1 per uploaded image
- **Edge Function Compute**: ~2-5 seconds per image
- **Bandwidth**: Reduced long-term due to WebP compression

**Optimization**: Delete originals after optimization to save 75% storage, or only keep thumbnail + medium for most use cases.

