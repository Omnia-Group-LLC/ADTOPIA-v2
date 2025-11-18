import { useEffect, useState, useMemo } from "react";
import { AdCard } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TiltCard } from "@/components/TiltCard";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { Lightbox } from "@/components/Lightbox";
import { 
  Eye, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Tag, 
  Calendar,
  Share2,
  Download,
  ExternalLink,
  Sparkles,
  QrCode
} from "lucide-react";
import { mockAdCards, mockUsers } from "@/lib/mockData";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";

interface AdDetailModalProps {
  ad: AdCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdDetailModal({ ad, isOpen, onClose }: AdDetailModalProps) {
  const { trackView, trackConversion } = useAnalyticsTracker();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '', title: '' });
  
  const creator = useMemo(() => {
    if (!ad) return null;
    return mockUsers.find(user => user.id === ad.user_id);
  }, [ad]);

  const relatedAds = useMemo(() => {
    if (!ad) return [];
    return mockAdCards
      .filter(card => 
        card.id !== ad.id && 
        card.metadata?.category === ad.metadata?.category &&
        card.status === 'published'
      )
      .slice(0, 3);
  }, [ad]);

  if (!ad) return null;

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && ad) {
      trackView(ad.id, {
        source: 'modal',
        category: ad.metadata?.category,
      });
    }
  }, [isOpen, ad, trackView]);

  const getCreatorInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const handleDownloadQRCode = async () => {
    const imageUrl = ad.image_url || ad.qr_code_url;
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${ad.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Track download as conversion
      trackConversion(ad.id, {
        source: 'image_download',
        category: ad.metadata?.category,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleImageClick = () => {
    const imageUrl = ad.image_url || ad.qr_code_url;
    if (imageUrl) {
      setLightboxImage({
        src: imageUrl,
        alt: ad.title,
        title: ad.title,
      });
      setLightboxOpen(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto glass border-primary/20">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {ad.metadata?.category && (
                  <Badge variant="outline" className="glass">
                    {ad.metadata.category}
                  </Badge>
                )}
                {ad.ai_generated && (
                  <Badge variant="outline" className="glass border-primary/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-3xl font-bold leading-tight mb-2">
                {ad.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {ad.description}
              </DialogDescription>
            </div>
            <FavoriteButton adId={ad.id} size="lg" />
          </div>
        </DialogHeader>
        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Large Preview */}
            <Card variant="glass" className="overflow-hidden">
              <CardContent className="p-0">
                <ImageWithFallback
                  src={ad.image_url || ad.qr_code_url}
                  alt={ad.title}
                  aspectRatio="video"
                  className="rounded-lg"
                  onImageClick={handleImageClick}
                  lazy={false}
                />
                
                {/* Action Buttons Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button variant="glass" size="sm" onClick={handleImageClick}>
                    <Share2 className="w-4 h-4 mr-2" />
                    View Full
                  </Button>
                  <Button variant="glass" size="sm" onClick={handleDownloadQRCode}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card variant="glass">
                <CardContent className="p-4 text-center">
                  <Eye className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{ad.metadata?.views || 0}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <div className="text-2xl font-bold">{ad.metadata?.conversions || 0}</div>
                  <div className="text-xs text-muted-foreground">Conversions</div>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-2 text-secondary" />
                  <div className="text-2xl font-bold">
                    {new Date(ad.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-muted-foreground">Published</div>
                </CardContent>
              </Card>
            </div>
            {/* Details */}
            <Card variant="glass">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {ad.metadata?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{ad.metadata.location}</span>
                    </div>
                  )}
                  {ad.metadata?.price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">${ad.metadata.price.toLocaleString()}</span>
                    </div>
                  )}
                  {ad.custom_url && (
                    <div className="flex items-center gap-2 col-span-2">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={ad.custom_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          // Track external link click as conversion
                          trackConversion(ad.id, {
                            source: 'external_link',
                            url: ad.custom_url,
                          });
                        }}
                      >
                        {ad.custom_url}
                      </a>
                    </div>
                  )}
                </div>
                
                {ad.metadata?.tags && ad.metadata.tags.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ad.metadata.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="glass">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6">
            {/* Creator Info */}
            {creator && (
              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-4">Creator</h3>
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={creator.metadata?.avatar_url} />
                      <AvatarFallback className="glass">
                        {getCreatorInitials(creator.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {creator.metadata?.company_name || creator.email.split('@')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {creator.subscription_tier.charAt(0).toUpperCase() + creator.subscription_tier.slice(1)} Member
                      </div>
                    </div>
                  </div>
                  <Button variant="glass" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* QR Code or Additional Image */}
            {(ad.qr_code_url || ad.image_url) && (
              <Card variant="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">
                      {ad.qr_code_url && !ad.image_url ? 'QR Code' : 'Preview'}
                    </h3>
                    <QrCode className="w-4 h-4 text-primary" />
                  </div>
                  <ImageWithFallback
                    src={ad.qr_code_url}
                    alt="QR Code"
                    aspectRatio="square"
                    className="bg-white border border-border/20 p-2"
                    onImageClick={() => {
                      if (ad.qr_code_url) {
                        setLightboxImage({
                          src: ad.qr_code_url,
                          alt: 'QR Code',
                          title: 'QR Code - ' + ad.title,
                        });
                        setLightboxOpen(true);
                      }
                    }}
                  />
                  {ad.custom_url && (
                    <p className="text-xs text-muted-foreground text-center mt-2 truncate">
                      Scan to visit: {ad.custom_url}
                    </p>
                  )}
                  <Button 
                    variant="glass" 
                    className="w-full mt-4"
                    onClick={handleDownloadQRCode}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card variant="glass">
              <CardContent className="p-6 space-y-3">
                <Button variant="ad-cta" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <Button variant="glass" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Ad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Ads */}
        {relatedAds.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border/50">
            <h3 className="text-xl font-semibold mb-6">Related Ads</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedAds.map((relatedAd) => (
                <TiltCard key={relatedAd.id}>
                  <Card 
                    variant="gallery-card"
                    className="h-64 cursor-pointer group"
                    onClick={() => {
                      onClose();
                      // Small delay to allow dialog to close before opening new one
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('openAdDetail', { detail: relatedAd }));
                      }, 100);
                    }}
                  >
                    <CardContent className="p-0 h-full relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background rounded-lg" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-background via-background/50 to-transparent">
                        <h4 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedAd.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {relatedAd.metadata?.views || 0}
                          </div>
                          {relatedAd.metadata?.price && (
                            <div className="flex items-center gap-1 font-semibold text-foreground">
                              ${relatedAd.metadata.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <FavoriteButton adId={relatedAd.id} onClick={(e) => e.stopPropagation()} />
                      </div>
                    </CardContent>
                  </Card>
                </TiltCard>
              ))}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Lightbox for full-size image viewing */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={lightboxImage.src}
        imageAlt={lightboxImage.alt}
        title={lightboxImage.title}
        description={ad?.description}
      />
    </Dialog>
  );
}

