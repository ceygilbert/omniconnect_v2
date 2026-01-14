
export interface MarketingData {
  facebookAds: {
    spend: number;
    clicks: number;
    conversions: number;
    roi: number;
  };
  googleAnalytics: {
    sessions: number;
    bounceRate: number;
    avgSessionDuration: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'customer';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppContact {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  avatar: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

export interface FacebookConfig {
  adAccountId: string;
  accessToken: string;
}

export interface GoogleConfig {
  propertyId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface AdSetInsight {
  name: string;
  spend: number;
  clicks: number;
  conversions: number;
  impressions: number;
  costPerConv: number;
  roi: number;
}
