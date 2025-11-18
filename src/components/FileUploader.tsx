import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
  onClearPreview?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  allowUrlInput?: boolean;
  onUrlInput?: (url: string) => void;
}

export function FileUploader({
  onFileSelect,
  accept = 'image/*',
  maxSizeMB = 5,
  preview,
  onClearPreview,
  isUploading = false,
  uploadProgress = 0,
  allowUrlInput = true,
  onUrlInput,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlValue && onUrlInput) {
      onUrlInput(urlValue);
      setUrlValue('');
      setShowUrlInput(false);
    }
  };

  if (preview) {
    return (
      <div className="relative w-full">
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          {onClearPreview && !isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isUploading && (
          <div className="mt-2 space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    );
  }

  if (showUrlInput && allowUrlInput) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
          />
          <Button type="button" onClick={handleUrlSubmit}>
            Add
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowUrlInput(false)}
        >
          Upload file instead
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center gap-4 text-center cursor-pointer">
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          )}
          
          <div>
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Drop image here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: {maxSizeMB}MB
            </p>
          </div>

          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground text-center">
            {uploadProgress}%
          </p>
        </div>
      )}

      {allowUrlInput && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowUrlInput(true)}
          className="w-full"
        >
          Or enter image URL
        </Button>
      )}
    </div>
  );
}

