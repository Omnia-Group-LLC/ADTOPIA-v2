export type UserRole = 'user' | 'editor' | 'admin' | 'super_admin' | 'enterprise';

export type AdStatus = 'draft' | 'published' | 'archived';

export type AdCategory = 'Real Estate' | 'Services' | 'Products' | 'Jobs' | 'Automotive' | 'Other';

export interface AdCard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  template_id?: string;
  qr_code_url?: string;
  custom_url?: string;
  image_url?: string;
  status: AdStatus;
  ai_generated: boolean;
  metadata?: {
    category?: AdCategory;
    views?: number;
    conversions?: number;
    location?: string;
    price?: number;
    tags?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface GalleryContainer {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  access_code?: string;
  card_ids: string[];
  display_order: string[];
  metadata?: {
    thumbnail_url?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

