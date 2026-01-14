
import React, { useState, useEffect } from 'react';
import { GoogleAnalyticsService } from '../services/googleAnalyticsService';
import { WhatsAppService } from '../services/whatsAppService';
import { FacebookAdsService } from '../services/facebookAdsService';
import { getSupabaseConfig, saveSupabaseConfig, isSupabaseConfigured } from '../services/supabaseClient';
import { WhatsAppConfig, FacebookConfig, GoogleConfig } from '../types';

const Connections: React.FC = () => {
  const [isGAConfigured, setIsGAConfigured] = useState(GoogleAnalyticsService.isConfigured());
  const [isWAConfigured, setIsWAConfigured] = useState(WhatsAppService.isConfigured());
  const [isFBConfigured, setIsFBConfigured] = useState(FacebookAdsService.isConfigured());
  const [isSBConfigured, setIsSBConfigured] = useState(isSupabaseConfigured());
  
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(
    WhatsAppService.getConfig() || { phoneNumberId: '', accessToken: '', businessAccountId: '' }
  );

  const [fbConfig, setFbConfig] = useState<FacebookConfig>(
    FacebookAdsService.getConfig() || { adAccountId: '', accessToken: '' }
  );

  const [googleConfig, setGoogleConfig] = useState<GoogleConfig>(
    GoogleAnalyticsService.getConfig() || { propertyId: '', clientId: '', clientSecret: '', refreshToken: '' }
  );

  const [sbConfig, setSbConfig] = useState({
    url: getSupabaseConfig().url,
    anonKey: getSupabaseConfig().anonKey
  });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveWA = (e: React.FormEvent) => {
    e.preventDefault();
    WhatsAppService.saveConfig(waConfig);
    setIsWAConfigured(true);
    setSaveStatus('WhatsApp Credentials Saved!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSaveFB = (e: React.FormEvent) => {
    e.preventDefault();
    FacebookAdsService.saveConfig(fbConfig);
    setIsFBConfigured(true);
    setSaveStatus('Facebook Ads Credentials Saved!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSaveGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    GoogleAnalyticsService.saveConfig(googleConfig);
    setIsGAConfigured(true);
    setSaveStatus('Google Analytics Credentials Saved!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(sbConfig.url, sbConfig.anonKey);
    setIsSBConfigured(true);
    setSaveStatus('Supabase Credentials Saved!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">API Backend Configuration</h2>
        <p className="text-slate-500 mt-1">Manage your business data pipeline and credentials.</p>
      </header>

      {saveStatus && (
        <div className="fixed top-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right-4">
          <p className="font-bold text-sm">✓ {saveStatus}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Supabase Card */}
        <div className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all duration-500 ${isSBConfigured ? 'border-emerald-100 ring-4 ring-emerald-50' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center p-4">
              <svg className="w-full h-full text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" /></svg>
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                isSBConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {isSBConfigured ? 'AUTH READY' : 'OFFLINE'}
              </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Supabase Auth</h3>
        </div>

        {/* GA4 Card */}
        <div className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all duration-500 ${isGAConfigured ? 'border-emerald-100 ring-4 ring-emerald-50' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center p-4">
              <img src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg" alt="GA4" className="w-full h-full object-contain" />
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                isGAConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {isGAConfigured ? 'CONNECTED' : 'ACTION REQUIRED'}
              </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">GA4 Metrics</h3>
        </div>

        {/* WhatsApp Card */}
        <div className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all duration-500 ${isWAConfigured ? 'border-emerald-100 ring-4 ring-emerald-50' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center p-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-full h-full object-contain" />
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                isWAConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {isWAConfigured ? 'LIVE API' : 'OFFLINE'}
              </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">WA Business</h3>
        </div>

        {/* Facebook Ads Card */}
        <div className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all duration-500 ${isFBConfigured ? 'border-emerald-100 ring-4 ring-emerald-50' : 'border-slate-100'}`}>
           <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center p-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="FB" className="w-full h-full object-contain" />
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                isFBConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {isFBConfigured ? 'SYNCING' : 'OFFLINE'}
              </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Meta Ads</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Supabase Config Panel */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-10 blur-3xl"></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-bold mb-2">Supabase Auth Gateway</h4>
            <p className="text-slate-400 mb-8 text-sm">Main authentication server credentials.</p>
            
            <form onSubmit={handleSaveSupabase} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project URL</label>
                <input 
                  type="text" 
                  value={sbConfig.url}
                  onChange={(e) => setSbConfig({...sbConfig, url: e.target.value})}
                  className="w-full bg-white border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  placeholder="https://xyz.supabase.co"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Anon Public Key</label>
                <input 
                  type="password" 
                  value={sbConfig.anonKey}
                  onChange={(e) => setSbConfig({...sbConfig, anonKey: e.target.value})}
                  className="w-full bg-white border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  placeholder="eyJhbGci..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all"
              >
                Update Core Auth Key
              </button>
            </form>
          </div>
        </div>

        {/* GA4 Setup Panel */}
        <div className="bg-amber-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full -mr-32 -mt-32 opacity-10 blur-3xl"></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-bold mb-2">Google Analytics 4</h4>
            <p className="text-amber-200/60 mb-8 text-sm">Marketing data pipeline credentials.</p>
            
            <form onSubmit={handleSaveGoogle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-amber-400/50 uppercase tracking-widest mb-1.5 ml-1">Property ID</label>
                  <input 
                    type="text" 
                    value={googleConfig.propertyId}
                    onChange={(e) => setGoogleConfig({...googleConfig, propertyId: e.target.value})}
                    className="w-full bg-white border border-amber-800 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    placeholder="e.g. 123456789"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-400/50 uppercase tracking-widest mb-1.5 ml-1">Client ID</label>
                  <input 
                    type="text" 
                    value={googleConfig.clientId}
                    onChange={(e) => setGoogleConfig({...googleConfig, clientId: e.target.value})}
                    className="w-full bg-white border border-amber-800 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    placeholder="...apps.googleusercontent.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-amber-400/50 uppercase tracking-widest mb-1.5 ml-1">Client Secret</label>
                <input 
                  type="password" 
                  value={googleConfig.clientSecret}
                  onChange={(e) => setGoogleConfig({...googleConfig, clientSecret: e.target.value})}
                  className="w-full bg-white border border-amber-800 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  placeholder="GOCSPX-..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-amber-400/50 uppercase tracking-widest mb-1.5 ml-1">Refresh Token</label>
                <input 
                  type="password" 
                  value={googleConfig.refreshToken}
                  onChange={(e) => setGoogleConfig({...googleConfig, refreshToken: e.target.value})}
                  className="w-full bg-white border border-amber-800 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  placeholder="1//..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-900/20 transition-all active:scale-95"
                >
                  Save Google Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
