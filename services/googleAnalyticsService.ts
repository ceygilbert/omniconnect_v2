
import { GoogleConfig } from '../types';

const CONFIG_KEY = 'omni_google_config';
let CURRENT_ACCESS_TOKEN: string | null = null;

export interface GADataPoint {
  name: string;
  traffic: number;
  conv: number;
}

export interface GALeadDetail {
  date: string;
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  users: number;
  conversions: number;
}

export class GoogleAnalyticsService {
  static saveConfig(config: GoogleConfig) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    CURRENT_ACCESS_TOKEN = null; // Force refresh on next call
  }

  static getConfig(): GoogleConfig | null {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.propertyId && config?.clientId && config?.clientSecret && config?.refreshToken);
  }

  private static async refreshAccessToken(): Promise<string> {
    const config = this.getConfig();
    if (!config) throw new Error("Google Analytics credentials missing.");

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || "Auth refresh failed. Check your Client ID, Secret, and Refresh Token.");
      }

      CURRENT_ACCESS_TOKEN = data.access_token;
      return CURRENT_ACCESS_TOKEN!;
    } catch (error: any) {
      console.error("GA4 Auth Error:", error);
      throw new Error(error.message || "OAuth Token Refresh Failed");
    }
  }

  static async getRealReport(): Promise<GADataPoint[]> {
    if (!this.isConfigured()) return [];
    
    const requestBody = {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'conversions' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
    };
    
    return this.runReport(requestBody, (row: any) => ({
      name: this.formatDate(row.dimensionValues[0].value),
      traffic: parseInt(row.metricValues[0].value) || 0,
      conv: parseInt(row.metricValues[1].value) || 0
    }));
  }

  static async getLeadDetails(): Promise<GALeadDetail[]> {
    if (!this.isConfigured()) return [];
    
    const requestBody = {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'date' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' }
      ],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'conversions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15
    };
    
    return this.runReport(requestBody, (row: any) => ({
      date: this.formatDate(row.dimensionValues[0].value),
      source: row.dimensionValues[1].value,
      medium: row.dimensionValues[2].value,
      campaign: row.dimensionValues[3].value,
      sessions: parseInt(row.metricValues[0].value) || 0,
      users: parseInt(row.metricValues[1].value) || 0,
      conversions: parseInt(row.metricValues[2].value) || 0
    }));
  }

  private static async runReport(body: any, mapper: (row: any) => any, retry: boolean = true): Promise<any[]> {
    const config = this.getConfig();
    if (!config) throw new Error("Not configured");

    if (!CURRENT_ACCESS_TOKEN) {
      await this.refreshAccessToken();
    }

    try {
      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CURRENT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        if (response.status === 401 && retry) {
          await this.refreshAccessToken();
          return this.runReport(body, mapper, false);
        }
        const error = await response.json();
        throw new Error(error.error?.message || 'GA4 API Error');
      }
      const data = await response.json();
      return (data.rows || []).map(mapper);
    } catch (e: any) {
      console.error("GA4 failure:", e);
      throw new Error(e.message || "Failed to fetch GA4 report");
    }
  }

  private static formatDate(gaDate: string) {
    const year = gaDate.substring(0, 4);
    const month = gaDate.substring(4, 6);
    const day = gaDate.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
