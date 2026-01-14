
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { getBusinessInsights, BusinessInsight } from '../services/geminiService';
import { GoogleAnalyticsService, GADataPoint, GALeadDetail } from '../services/googleAnalyticsService';
import { GoogleConfig } from '../types';

const Dashboard: React.FC = () => {
  const [isGAConfigured, setIsGAConfigured] = useState(GoogleAnalyticsService.isConfigured());
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [chartData, setChartData] = useState<GADataPoint[]>([]);
  const [leads, setLeads] = useState<GALeadDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup form state
  const [setupData, setSetupData] = useState<GoogleConfig>(
    GoogleAnalyticsService.getConfig() || { propertyId: '', clientId: '', clientSecret: '', refreshToken: '' }
  );

  const loadData = async () => {
    if (!isGAConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const [reportData, leadData] = await Promise.all([
        GoogleAnalyticsService.getRealReport(),
        GoogleAnalyticsService.getLeadDetails()
      ]);
      
      setChartData(reportData);
      setLeads(leadData);
      
      // Attempt insights if data exists
      if (reportData.length > 0) {
        const aiInsights = await getBusinessInsights({ 
          source: 'GA4 Live Monthly Data',
          metrics: reportData,
          leadSummary: leadData.slice(0, 5)
        });
        setInsights(aiInsights);
      }
    } catch (e: any) {
      setError(e.message || "Failed to sync with Google API. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.propertyId || !setupData.clientId || !setupData.clientSecret || !setupData.refreshToken) {
      setError("Please fill in all Google Cloud API fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Test the configuration by attempting a report fetch
      GoogleAnalyticsService.saveConfig(setupData);
      
      // Switch to configured state - this triggers the main dashboard view
      setIsGAConfigured(true);
      // loadData is triggered by useEffect [isGAConfigured]
    } catch (err: any) {
      setError(err.message || "Invalid setup. Check your credentials.");
      setIsGAConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGAConfigured) {
      loadData();
    }
  }, [isGAConfigured]);

  if (!isGAConfigured) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-700 p-4">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-amber-600 p-10 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mb-4 mx-auto border border-white/30">
              <img src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg" className="w-12 h-12 brightness-0 invert" alt="GA4" />
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">Connect Google Analytics</h2>
            <p className="text-amber-100 text-sm opacity-90 max-w-md mx-auto">Establish a secure link to your GA4 property to enable backend intelligence and real-time visitor tracking.</p>
          </div>

          <form onSubmit={handleSetupSubmit} className="p-10 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in shake">
                ⚠️ {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">GA4 Property ID</label>
                <input 
                  required
                  type="text" 
                  value={setupData.propertyId}
                  onChange={e => setSetupData({...setupData, propertyId: e.target.value})}
                  placeholder="e.g. 514477194"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">OAuth Client ID</label>
                <input 
                  required
                  type="text" 
                  value={setupData.clientId}
                  onChange={e => setSetupData({...setupData, clientId: e.target.value})}
                  placeholder="...apps.googleusercontent.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Client Secret</label>
                <input 
                  required
                  type="password" 
                  value={setupData.clientSecret}
                  onChange={e => setSetupData({...setupData, clientSecret: e.target.value})}
                  placeholder="GOCSPX-..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Refresh Token</label>
                <input 
                  required
                  type="password" 
                  value={setupData.refreshToken}
                  onChange={e => setSetupData({...setupData, refreshToken: e.target.value})}
                  placeholder="1//..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-200 transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest text-xs"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                'ESTABLISH SECURE GOOGLE DATA PIPELINE'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Backend Overview</h2>
          <div className="flex items-center mt-1 text-sm">
            <span className="text-emerald-600 font-bold flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              LIVE DATA STREAMING: PROPERTY {setupData.propertyId}
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
             onClick={() => {
               if(window.confirm('Disconnect Google Analytics?')) {
                 localStorage.removeItem('omni_google_config');
                 setIsGAConfigured(false);
                 setChartData([]);
                 setLeads([]);
                 setInsights([]);
               }
             }}
             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 transition-all"
          >
            Disconnect
          </button>
          <button onClick={loadData} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center">
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            )}
            Sync Live Metrics
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-sm flex items-center shadow-sm">
          <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          <div>
            <p className="font-black uppercase tracking-tight text-xs">API Communication Error</p>
            <p className="opacity-80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Users (30d)" value={chartData.reduce((acc, curr) => acc + curr.traffic, 0).toLocaleString()} change="Monthly" isPositive={true} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
        <StatCard title="Total Leads (30d)" value={leads.reduce((acc, curr) => acc + curr.conversions, 0)} change="Monthly" isPositive={true} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
        <StatCard title="Primary Channel" value={leads[0]?.source || 'Scanning...'} change="Top" isPositive={true} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>} />
        <StatCard title="Sessions" value={leads.reduce((acc, curr) => acc + curr.sessions, 0).toLocaleString()} change="Traffic" isPositive={true} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[450px]">
            <h3 className="font-black text-slate-800 mb-8 uppercase tracking-widest text-sm flex items-center">
               <svg className="w-5 h-5 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>
               Monthly Traffic & Conversion Flow
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px'}} />
                  <Area type="monotone" dataKey="traffic" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTraffic)" name="Active Visitors" />
                  <Area type="monotone" dataKey="conv" stroke="#10b981" strokeWidth={4} fillOpacity={0} name="Leads Generated" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Real-Time Traffic Sources (GA4)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/30">
                  <tr>
                    <th className="px-6 py-5 font-black tracking-widest">Date</th>
                    <th className="px-6 py-5 font-black tracking-widest">Source / Medium</th>
                    <th className="px-6 py-5 font-black tracking-widest">Campaign</th>
                    <th className="px-6 py-5 font-black tracking-widest text-right">Sessions</th>
                    <th className="px-6 py-5 font-black tracking-widest text-right">Convs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.length > 0 ? leads.map((lead, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-500">{lead.date}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <span className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${lead.source.includes('facebook') ? 'bg-blue-500' : lead.source.includes('google') ? 'bg-orange-400' : lead.source.includes('direct') ? 'bg-slate-400' : 'bg-indigo-400'}`}></span>
                          <span className="text-slate-900 font-black tracking-tight">{lead.source}</span>
                          <span className="text-slate-300 mx-1.5 font-light">/</span>
                          <span className="text-slate-500 italic font-medium">{lead.medium}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400 italic text-xs truncate max-w-[150px]">{lead.campaign === '(not set)' ? 'Direct / General' : lead.campaign}</td>
                      <td className="px-6 py-5 text-right font-black text-slate-700">{lead.sessions.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-xs ${lead.conversions > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                          {lead.conversions}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic">
                        {loading ? 'Decrypting live data stream...' : 'Awaiting traffic synchronization.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
            <h3 className="font-black text-lg mb-8 flex items-center uppercase tracking-tighter">
              <span className="bg-indigo-500 text-white p-2 rounded-xl mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
              </span>
              Intelligence Pulse
            </h3>
            <div className="space-y-6">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <div key={idx} className="bg-indigo-800/30 rounded-2xl p-6 border border-indigo-700/50 hover:bg-indigo-800/50 transition-all cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-indigo-200">{insight.title}</h4>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                      insight.impact === 'high' ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-indigo-100'
                    }`}>Impact: {insight.impact}</span>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed mb-4">{insight.description}</p>
                  <div className="bg-indigo-950/40 p-3 rounded-xl border-l-4 border-emerald-400">
                    <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-widest mb-1">Recommended Action:</p>
                    <p className="text-xs text-indigo-100 italic">{insight.recommendation}</p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-indigo-800/40 rounded-2xl"></div>
                    <div className="h-20 bg-indigo-800/40 rounded-2xl"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
             <h4 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Top Traffic Channels</h4>
             <div className="space-y-6">
                {Array.from(new Set(leads.map(l => l.source))).slice(0, 5).map((source, i) => {
                  const count = leads.filter(l => l.source === source).reduce((a, b) => a + b.sessions, 0);
                  const total = leads.reduce((a, b) => a + b.sessions, 0) || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs items-center">
                        <span className="font-black text-slate-700 truncate mr-2 uppercase tracking-tight">{source}</span>
                        <span className="text-indigo-600 font-black">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
