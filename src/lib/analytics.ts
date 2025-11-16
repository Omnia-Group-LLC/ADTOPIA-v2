// Google Analytics integration for tracking key events

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Google Analytics 4 tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export class Analytics {
  private static isInitialized = false;
  
  private static get isDevelopment() {
    return typeof window !== 'undefined' && window.location.hostname === 'localhost';
  }

  static init(measurementId?: string) {
    if (this.isInitialized || this.isDevelopment) return;
    
    // Import APP config to get GA_ID
    import('@/config/appConfig').then(({ APP }) => {
      const trackingId = measurementId || APP.GA_ID;
      
      if (!trackingId || trackingId === '') {
        console.warn('Google Analytics tracking ID not configured');
        return;
      }

      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      document.head.appendChild(script);

      // Initialize dataLayer and gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer!.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', trackingId, {
        send_page_view: false // We'll send page views manually
      });

      this.isInitialized = true;
      console.log('Google Analytics initialized with ID:', trackingId);
    }).catch(error => {
      console.warn('Failed to load GA config:', error);
    });
  }

  static track(event: AnalyticsEvent) {
    if (this.isDevelopment) {
      console.log('Analytics Event (dev mode):', event);
      return;
    }

    if (!window.gtag) {
      console.warn('Google Analytics not initialized');
      return;
    }

    const { event_name, event_category, event_label, value, custom_parameters } = event;
    
    window.gtag('event', event_name, {
      event_category,
      event_label,
      value,
      ...custom_parameters
    });
  }

  // Predefined event tracking methods for launch QA
  static trackPreviewViewed(source: 'hero_cta' | 'pricing_modal' | 'urgency_section' = 'hero_cta') {
    this.track({
      event_name: 'preview_viewed',
      event_category: 'engagement',
      event_label: source,
      custom_parameters: { traffic_source: source }
    });
  }

  static trackPriceClicked(tier: string, source: 'hero' | 'pricing' | 'urgency' | 'mobile_sticky' = 'pricing') {
    this.track({
      event_name: 'price_clicked',
      event_category: 'engagement',
      event_label: tier,
      custom_parameters: { package_tier: tier, click_source: source }
    });
  }

  static trackPaymentLinkOpened(tier: string, price: number) {
    this.track({
      event_name: 'payment_link_opened',
      event_category: 'commerce',
      event_label: tier,
      value: price,
      custom_parameters: { package_tier: tier, price_amount: price }
    });
  }

  static trackSuccessViewed(tier: string, price: number) {
    this.track({
      event_name: 'success_viewed',
      event_category: 'commerce', 
      event_label: tier,
      value: price,
      custom_parameters: { package_tier: tier, purchase_amount: price }
    });
  }

  static trackEmailHold(email: string) {
    this.track({
      event_name: 'email_hold_30_days',
      event_category: 'engagement',
      event_label: 'free_hold',
      custom_parameters: { user_email: email, hold_duration: '30_days' }
    });
  }
  static trackCardUpload(method: 'image' | 'csv' | 'json' | 'demo', count: number) {
    this.track({
      event_name: 'card_upload',
      event_category: 'content',
      event_label: method,
      value: count,
      custom_parameters: { upload_method: method, card_count: count }
    });
  }

  static trackCardDownload(cardTitle: string) {
    this.track({
      event_name: 'card_download',
      event_category: 'content',
      event_label: cardTitle
    });
  }

  static trackQRGeneration(variant: string, cardId: string) {
    this.track({
      event_name: 'qr_generated',
      event_category: 'features',
      event_label: variant,
      custom_parameters: { card_id: cardId, qr_variant: variant }
    });
  }

  static trackExportStart(format: string, preset?: string) {
    this.track({
      event_name: 'export_start',
      event_category: 'features',
      event_label: format,
      custom_parameters: { export_format: format, export_preset: preset }
    });
  }

  static trackPaymentAttempt(tier: string, addOns: string[], totalPrice: number) {
    this.track({
      event_name: 'payment_attempt',
      event_category: 'commerce',
      event_label: tier,
      value: totalPrice,
      custom_parameters: { 
        package_tier: tier, 
        add_ons: addOns.join(','),
        total_value: totalPrice
      }
    });
  }

  static trackModeToggle(mode: 'admin' | 'customer' | 'test' | 'live') {
    this.track({
      event_name: 'mode_toggle',
      event_category: 'interface',
      event_label: mode,
      custom_parameters: { app_mode: mode }
    });
  }

  static trackProjectExport() {
    this.track({
      event_name: 'project_export',
      event_category: 'features',
      event_label: 'json_download'
    });
  }

  static trackProjectImport(cardsImported: number) {
    this.track({
      event_name: 'project_import',
      event_category: 'features', 
      event_label: 'json_upload',
      value: cardsImported,
      custom_parameters: { imported_cards: cardsImported }
    });
  }

  static trackGiftClaim() {
    this.track({
      event_name: 'gift_claimed',
      event_category: 'engagement',
      event_label: 'free_translation'
    });
  }
}

// Auto-initialize on import (you can pass a custom tracking ID if needed)
Analytics.init();