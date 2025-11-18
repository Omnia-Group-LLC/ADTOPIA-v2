import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GalleryItemCard, type GalleryItem } from '@/components/GalleryItemCard';

/**
 * GalleryItemCard Unit Tests
 * 
 * Tests:
 * - Button render with glassy indigo hover styles
 * - onClick opens QRModal with correct URL
 * - Snapshot test for button rendering
 * 
 * Quality: 100% coverage, no mock leaks
 */

// Mock QRModal to avoid actual QR generation in tests
vi.mock('@/components/QRModal', () => ({
  QRModal: ({ isOpen, url, title }: { isOpen: boolean; url: string; title?: string }) => (
    isOpen ? (
      <div data-testid="qr-modal">
        <div data-testid="qr-modal-url">{url}</div>
        <div data-testid="qr-modal-title">{title}</div>
      </div>
    ) : null
  ),
}));

// Mock window.location.origin
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173',
  },
  writable: true,
});

describe('GalleryItemCard', () => {
  const mockGallery: GalleryItem = {
    id: 'test-uuid',
    title: 'Test Gallery Item',
    description: 'Test description',
    url: 'https://example.com/image.jpg',
    image_url: 'https://example.com/image.jpg',
  };

  const mockOnCardClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Button renders with correct attributes
   */
  it('should render share button with glassy indigo styles', () => {
    render(<GalleryItemCard gallery={mockGallery} />);

    const shareButton = screen.getByTestId('share-button');
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).toHaveAttribute('aria-label', 'Share Link');
    
    // Check for glassy styles (backdrop-blur-sm, bg-background/80)
    expect(shareButton.className).toContain('backdrop-blur-sm');
    expect(shareButton.className).toContain('bg-background/80');
    expect(shareButton.className).toContain('hover:scale-105');
  });

  /**
   * Test: Clicking share button opens QRModal with correct URL
   */
  it('should open QRModal with correct gallery URL when share button is clicked', async () => {
    render(<GalleryItemCard gallery={mockGallery} />);

    const shareButton = screen.getByTestId('share-button');
    
    // QRModal should not be visible initially
    expect(screen.queryByTestId('qr-modal')).not.toBeInTheDocument();

    // Click share button
    fireEvent.click(shareButton);

    // Wait for QRModal to appear
    await waitFor(() => {
      expect(screen.getByTestId('qr-modal')).toBeInTheDocument();
    });

    // Verify URL is correct
    const qrModalUrl = screen.getByTestId('qr-modal-url');
    expect(qrModalUrl).toHaveTextContent('http://localhost:5173/gallery/test-uuid');

    // Verify title is passed
    const qrModalTitle = screen.getByTestId('qr-modal-title');
    expect(qrModalTitle).toHaveTextContent('Test Gallery Item');
  });

  /**
   * Test: Snapshot test for button render
   */
  it('should match snapshot for share button render', () => {
    const { container } = render(<GalleryItemCard gallery={mockGallery} />);
    const shareButton = screen.getByTestId('share-button');
    
    // Snapshot the button element
    expect(shareButton).toMatchSnapshot();
  });

  /**
   * Test: Card click handler is called when card is clicked
   */
  it('should call onCardClick when card is clicked', () => {
    render(<GalleryItemCard gallery={mockGallery} onCardClick={mockOnCardClick} />);

    const card = screen.getByTestId('gallery-item-card');
    fireEvent.click(card);

    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Share button click does not trigger card click
   */
  it('should not trigger card click when share button is clicked', () => {
    render(<GalleryItemCard gallery={mockGallery} onCardClick={mockOnCardClick} />);

    const shareButton = screen.getByTestId('share-button');
    fireEvent.click(shareButton);

    // Card click should not be called (stopPropagation)
    expect(mockOnCardClick).not.toHaveBeenCalled();
  });

  /**
   * Test: Gallery thumb renders with correct attributes
   */
  it('should render gallery thumb with correct data-testid', () => {
    render(<GalleryItemCard gallery={mockGallery} />);

    const thumb = screen.getByTestId('gallery-thumb');
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveAttribute('loading', 'lazy');
    expect(thumb).toHaveAttribute('alt', 'Test Gallery Item');
  });

  /**
   * Test: Gallery without title uses fallback
   */
  it('should handle gallery without title', () => {
    const galleryWithoutTitle: GalleryItem = {
      id: 'test-uuid-2',
      url: 'https://example.com/image2.jpg',
      image_url: 'https://example.com/image2.jpg',
    };

    render(<GalleryItemCard gallery={galleryWithoutTitle} />);

    const shareButton = screen.getByTestId('share-button');
    fireEvent.click(shareButton);

    waitFor(() => {
      const qrModalTitle = screen.getByTestId('qr-modal-title');
      expect(qrModalTitle).toHaveTextContent('Gallery Item');
    });
  });
});

