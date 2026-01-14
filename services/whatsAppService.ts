
import { WhatsAppConfig, WhatsAppContact, ChatMessage } from '../types';

const CONFIG_KEY = 'omni_whatsapp_config';
const CONTACTS_KEY = 'omni_whatsapp_contacts';
const HISTORY_KEY = 'omni_whatsapp_history';

export class WhatsAppService {
  static saveConfig(config: WhatsAppConfig) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  static getConfig(): WhatsAppConfig | null {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.accessToken && config?.phoneNumberId);
  }

  // Contact Persistence
  static getContacts(): WhatsAppContact[] {
    const saved = localStorage.getItem(CONTACTS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static saveContact(contact: WhatsAppContact) {
    const contacts = this.getContacts();
    const existing = contacts.findIndex(c => c.phone === contact.phone);
    if (existing >= 0) {
      contacts[existing] = contact;
    } else {
      contacts.push(contact);
    }
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }

  // History Persistence
  static getHistory(phone: string): ChatMessage[] {
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return allHistory[phone] || [];
  }

  static saveMessage(phone: string, message: ChatMessage) {
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    if (!allHistory[phone]) allHistory[phone] = [];
    allHistory[phone].push(message);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  }

  /**
   * Sends a text message using the Meta Graph API
   */
  static async sendMessage(to: string, message: string): Promise<any> {
    const config = this.getConfig();
    if (!config) throw new Error("WhatsApp API not configured. Please enter your credentials.");

    const cleanPhone = to.replace(/\D/g, '');

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: { body: message }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Meta API Error: Check your Token or Phone ID");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network Error: Failed to reach Meta Servers");
    }
  }
}
