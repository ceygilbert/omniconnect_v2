
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@omniconnect.cloud');
  const [password, setPassword] = useState('ZaqwsxCde12345!$');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Hardcoded credential validation
    setTimeout(() => {
      if (email === 'admin@omniconnect.cloud' && password === 'ZaqwsxCde12345!$') {
        onLogin({
          id: 'admin-1',
          email: email,
          name: 'Administrator',
          role: 'admin'
        });
      } else {
        setError("Invalid email or password. Please use the system defaults.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-8 bg-slate-900 overflow-hidden relative min-h-screen">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-8 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-indigo-900 font-black text-4xl shadow-2xl shadow-indigo-500/50 mb-6">
            O
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            OmniConnect: Real-time business intelligence.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-[2.5rem] border border-slate-700/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-bold animate-in shake">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-4 bg-white border border-slate-700 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="name@company.cloud"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-4 bg-white border border-slate-700 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Secure Login'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Workspace Restricted. Use system administrator credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
