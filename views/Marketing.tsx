
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMarketingStrategy, AdStrategy } from '../services/geminiService';
import { FacebookAdsService } from '../services/facebookAdsService';
import { AdSetInsight, FacebookConfig } from '../types';

const Marketing: React.FC = () => {
  const [isFBConfigured, setIsFBConfigured] = useState(FacebookAdsService.isConfigured());
  const [adSets, setAdSets] = useState<AdSetInsight[]>([]);
  const [strategy, setStrategy] = useState<AdStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup form state
  const [setupData, setSetupData] = useState<FacebookConfig>({
    adAccountId: '',
    accessToken: ''
  });

  const fetchRealData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FacebookAdsService.getAdSetInsights();
      setAdSets(data);
      
      const aiResult = await getMarketingStrategy(data);
      setStrategy(aiResult);
    } catch (err: any) {
      setError(err.message);
      // If we got a serious auth error, we might want to prompt for setup again
      if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('credentials')) {
        // We don't force un-configure, but we keep the error visible
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFBConfigured) {
      fetchRealData();
    }
  }, [isFBConfigured]);

  const handleInitialConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.adAccountId || !setupData.accessToken) {
      setError("Please enter both Ad Account ID and Access Token.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Save locally
      FacebookAdsService.saveConfig(setupData);
      
      // 2. Immediate verification fetch
      const data = await FacebookAdsService.getAdSetInsights();
      setAdSets(data);
      
      const aiResult = await getMarketingStrategy(data);
      setStrategy(aiResult);
      
      // 3. Update UI state
      setIsFBConfigured(true);
    } catch (err: any) {
      setError(err.message);
      // Clean up if the first attempt failed
      localStorage.removeItem('omni_facebook_config');
    } finally {
      setLoading(false);
    }
  };

  const bestCampaign = [...adSets].sort((a, b) => (a.costPerConv || 9999) - (b.costPerConv || 9999))[0];
  const worstCampaign = [...adSets].sort((a, b) => (b.costPerConv || 0) - (a.costPerConv || 0))[0];

  if (!isFBConfigured) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-700 p-4">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mb-4 mx-auto border border-white/30">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-12 h-12" alt="Meta" />
            </div>
            <h2 className="text-3xl font-black mb-2">Connect Meta Ads Manager</h2>
            <p className="text-blue-100 text-sm opacity-90">Securely link your Facebook Ad Account to enable AI-powered analysis.</p>
          </div>

          <form onSubmit={handleInitialConnect} className="p-10 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in shake duration-300">
                ⚠️ {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ad Account ID</label>
                <input 
                  required
                  type="text" 
                  value={setupData.adAccountId}
                  onChange={e => setSetupData({...setupData, adAccountId: e.target.value})}
                  placeholder="e.g. 1234567890 (or act_1234567890)"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono"
                />
                <p className="text-[9px] text-slate-400 mt-1.5 ml-1">Found in Ads Manager Settings or URL.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">System User Access Token</label>
                <input 
                  required
                  type="password" 
                  value={setupData.accessToken}
                  onChange={e => setSetupData({...setupData, accessToken: e.target.value})}
                  placeholder="EAAB..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono"
                />
                <p className="text-[9px] text-slate-400 mt-1.5 ml-1">Requires <code>ads_read</code> and <code>ads_management</code> scopes.</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                'ESTABLISH SECURE CONNECTION'
              )}
            </button>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                Your credentials are encrypted and stored locally in your browser session. 
                They are never transmitted to any server other than Meta's official API.
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Marketing Intelligence</h2>
          <div className="flex items-center mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Real-Time Meta Ads Data Feed</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
               if(window.confirm('Disconnect Meta Ads Manager and clear credentials?')) {
                 localStorage.removeItem('omni_facebook_config');
                 setIsFBConfigured(false);
                 setAdSets([]);
               }
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            Disconnect
          </button>
          <button 
            onClick={fetchRealData}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            )}
            Refresh Metrics
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-center text-rose-600 text-sm shadow-sm animate-in slide-in-from-top-2">
           <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
           <div>
             <p className="font-black uppercase tracking-tight text-xs">Sync Error Detected</p>
             <p className="opacity-90 mt-0.5">{error}</p>
           </div>
        </div>
      )}

      {/* KPI Spotlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Active Spend</p>
           <h4 className="text-2xl font-black text-slate-800 tracking-tighter">${adSets.reduce((a, b) => a + b.spend, 0).toLocaleString()}</h4>
        </div>
        
        {bestCampaign && (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl relative overflow-hidden">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Top CPA Performer</p>
            <h4 className="text-lg font-bold text-emerald-900 truncate mb-1">{bestCampaign.name}</h4>
            <p className="text-2xl font-black text-emerald-700">${bestCampaign.costPerConv.toFixed(2)} <span className="text-xs font-normal text-emerald-600/70">CPA</span></p>
          </div>
        )}

        <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex items-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-20 blur-2xl"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center mb-1.5">
              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Gemini Strategy Engine</p>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed italic pr-10">
              {adSets.length > 0 ? `I've analyzed ${adSets.length} live ad sets. Your most efficient scaling opportunity is currently "${bestCampaign?.name || 'Unknown'}".` : "Synchronize your data to receive automated spend reallocation advice."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="font-black text-slate-800 mb-6 flex items-center text-sm uppercase tracking-widest">
              <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Ad Set Insights (Live 30d)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-y border-slate-50">
                  <tr>
                    <th className="px-4 py-4 font-black tracking-widest">Ad Set Name</th>
                    <th className="px-4 py-4 font-black tracking-widest text-right">Spend</th>
                    <th className="px-4 py-4 font-black tracking-widest text-right">Convs</th>
                    <th className="px-4 py-4 font-black tracking-widest text-right">CPA</th>
                    <th className="px-4 py-4 font-black tracking-widest text-right text-indigo-600">ROI</th>
                    <th className="px-4 py-4 text-center font-black tracking-widest">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {adSets.length > 0 ? adSets.map((adset, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-5">
                         <div className="font-bold text-slate-700 truncate max-w-[180px]">{adset.name}</div>
                         <div className="text-[9px] text-slate-400 mt-0.5">{adset.clicks.toLocaleString()} Clicks / {adset.impressions.toLocaleString()} Impr.</div>
                      </td>
                      <td className="px-4 py-5 text-right text-slate-600 font-medium">${adset.spend.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right text-slate-600">{adset.conversions}</td>
                      <td className="px-4 py-5 text-right font-bold text-slate-800">${adset.costPerConv.toFixed(2)}</td>
                      <td className="px-4 py-5 text-right font-black text-indigo-600">{adset.roi.toFixed(2)}x</td>
                      <td className="px-4 py-5">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${adset.roi > 2 ? 'bg-emerald-500' : adset.roi > 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, adset.roi * 25)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-20 text-center text-slate-300 italic">No ad sets found in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-8 flex items-center text-sm uppercase tracking-widest">Performance Visualization</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adSets}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} hide />
                  <YAxis yAxisId="left" orientation="left" stroke="#6366f1" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px'}} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}} />
                  <Bar yAxisId="left" dataKey="costPerConv" name="Cost Per Conv ($)" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={45} />
                  <Bar yAxisId="right" dataKey="roi" name="Return Value (x)" fill="#10b981" radius={[8, 8, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Strategy Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-indigo-50 relative overflow-hidden ring-1 ring-indigo-50">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center uppercase tracking-tighter">
              <span className="bg-indigo-600 text-white p-2.5 rounded-2xl mr-4 shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </span>
              Optimization Hub
            </h3>

            {strategy ? (
              <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 ml-1">Top Reallocation Target</label>
                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 shadow-sm">
                    <p className="font-black text-indigo-900 text-lg leading-tight mb-2">{strategy.winner}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{strategy.reasoning}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4 ml-1">Tactical Checklist</label>
                  <ul className="space-y-4">
                    {strategy.tacticalAdvice.map((step, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-700 font-medium">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black mt-0.5 mr-4 shadow-md shadow-emerald-100">{idx + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scaling Potential</span>
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                        strategy.scalingPotential === 'high' ? 'bg-emerald-100 text-emerald-700' : 
                        strategy.scalingPotential === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {strategy.scalingPotential}
                      </span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center opacity-40 grayscale flex flex-col items-center">
                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Awaiting Feed Integration</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
