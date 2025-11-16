import { supabase } from './supabase/client';

export interface AdCard {
  id: string;
  tenant_id: string;
  package_id: string;
  card_type: 'single_ad' | 'package_ad';
  display_order: number;
  title: string;
  image_url: string;
  landing_page_url: string;
  language: string;
  status: string;
  created_at: string;
  ad_packages?: {
    name: string;
    package_type: string;
  };
}

export async function fetchGalleryCards(
  tenantId: string,
  view: 'all' | 'packages' | 'single_ads' = 'all',
  packageId?: string
): Promise<AdCard[]> {
  const params = new URLSearchParams({
    tenant: tenantId,
    view,
  });

  if (packageId) {
    params.append('packageId', packageId);
  }

  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gallery-view?${params}`,
    {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch gallery cards');
  }

  const { data } = await response.json();
  return data;
}

export async function reorderCard(
  tenantId: string,
  cardId: string,
  newPosition: number
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gallery-reorder`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ tenantId, cardId, newPosition }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reorder card');
  }
}

export async function deleteCard(tenantId: string, cardId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gallery-delete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ tenantId, cardId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete card');
  }
}

// Alias functions for backwards compatibility with tests
export const reorderAdCard = reorderCard;
export const deleteAdCard = deleteCard;

// Admin gallery functions
export interface AdminGalleryOptions {
  tenantId: string;
  view: 'all' | 'packages' | 'single_ads';
  packageId?: string;
}

export async function getAdminGalleryCards(options: AdminGalleryOptions): Promise<AdCard[]> {
  return fetchGalleryCards(options.tenantId, options.view, options.packageId);
}

// Tenant management functions
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  primary_color?: string;
  logo_url?: string;
}

export async function getTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, subdomain, primary_color, logo_url')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch tenants: ${error.message}`);
  }

  return data || [];
}

export async function getTenantPackages(tenantId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('ad_packages')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tenant packages: ${error.message}`);
  }

  return data || [];
}
