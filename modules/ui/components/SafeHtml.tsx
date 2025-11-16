/**
 * Safe HTML Component - XSS Protection
 * 
 * Renders HTML content with proper sanitization to prevent XSS attacks.
 * Use this instead of dangerouslySetInnerHTML directly.
 */

import { useMemo } from 'react';

interface SafeHtmlProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * Basic HTML sanitization function
 * In production, consider using DOMPurify for more comprehensive sanitization
 */
function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
}

export function SafeHtml({ html, className, tag: Tag = 'div' }: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

/**
 * Alternative: Structured data rendering (preferred approach)
 * Use this when possible instead of HTML injection
 */
export function StructuredContent({ content }: { content: any }) {
  // Render structured data as JSX instead of HTML
  return (
    <div className="structured-content">
      {typeof content === 'string' ? (
        <p>{content}</p>
      ) : (
        <pre>{JSON.stringify(content, null, 2)}</pre>
      )}
    </div>
  );
}
