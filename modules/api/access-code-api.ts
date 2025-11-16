// API client for access code verification and package preview

export interface AccessCodeVerification {
  valid: boolean;
  packageId?: string;
  tenantId?: string;
  daysRemaining?: number;
  error?: string;
}

export interface PackagePreview {
  package: {
    id: string;
    name: string;
    package_type: '5_card' | '7_card';
    customer_email: string;
  };
  cards: Array<{
    id: string;
    title: string;
    image_url: string;
    landing_page_url: string | null;
    display_order: number;
  }>;
  theme: {
    primary_color?: string;
    logo_url?: string;
  };
}

export async function verifyAccessCode(code: string): Promise<AccessCodeVerification> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-access-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify access code');
  }

  return response.json();
}

export async function getPackagePreview(packageId: string, tenantId: string): Promise<PackagePreview> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-package-preview?packageId=${packageId}&tenantId=${tenantId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load package preview');
  }

  return response.json();
}

