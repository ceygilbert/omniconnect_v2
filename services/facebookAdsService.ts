
import { FacebookConfig, AdSetInsight } from '../types';

const CONFIG_KEY = 'omni_facebook_config';

export class FacebookAdsService {
  static saveConfig(config: FacebookConfig) {
    // Ensure account ID is properly formatted
    let id = config.adAccountId.trim();
    if (id && !id.startsWith('act_')) {
      id = `act_${id}`;
    }
    const finalConfig = { ...config, adAccountId: id };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(finalConfig));
    return finalConfig;
  }

  static getConfig(): FacebookConfig | null {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.accessToken && config?.adAccountId);
  }

  /**
   * Fetches insights for all ad sets in the account for the last 30 days
   */
  static async getAdSetInsights(): Promise<AdSetInsight[]> {
    const config = this.getConfig();
    if (!config) throw new Error("Credentials missing. Please configure your Ad Account ID and Access Token.");

    // We fetch detailed metrics including actions (conversions) and values
    const fields = 'adset_name,spend,clicks,impressions,actions,action_values';
    const url = `https://graph.facebook.com/v21.0/${config.adAccountId}/insights?level=adset&fields=${fields}&date_preset=last_30d&access_token=${config.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 190) {
          throw new Error("Invalid or Expired Access Token. Please provide a new System User Token.");
        }
        if (data.error?.code === 100) {
          throw new Error("Invalid Ad Account ID. Ensure it starts with 'act_'.");
        }
        throw new Error(data.error?.message || "Failed to connect to Meta Ads Manager.");
      }

      const results = (data.data || []).map((item: any) => {
        const spend = parseFloat(item.spend || '0');
        
        // Find common conversion actions
        const conversionsAction = (item.actions || []).find((a: any) => 
          ['lead', 'purchase', 'offsite_conversion.fb_pixel_lead', 'contact'].includes(a.action_type)
        );
        const conversions = parseInt(conversionsAction?.value || '0');

        // Find conversion values for ROI
        const valueAction = (item.action_values || []).find((v: any) => 
          ['lead', 'purchase', 'offsite_conversion.fb_pixel_lead'].includes(v.action_type)
        );
        const totalValue = parseFloat(valueAction?.value || '0');

        const costPerConv = conversions > 0 ? spend / conversions : 0;
        const roi = spend > 0 ? totalValue / spend : 0;

        return {
          name: item.adset_name,
          spend: spend,
          clicks: parseInt(item.clicks || '0'),
          impressions: parseInt(item.impressions || '0'),
          conversions: conversions,
          costPerConv: costPerConv,
          roi: roi
        };
      });

      if (results.length === 0) {
        throw new Error("No active ad sets found in this account for the last 30 days.");
      }

      return results;
    } catch (error: any) {
      console.error("Facebook Ads Connection Error:", error);
      throw error;
    }
  }
}
