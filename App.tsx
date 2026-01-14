
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Marketing from './views/Marketing';
import WhatsAppCRM from './views/WhatsAppCRM';
import Connections from './views/Connections';
import Login from './views/Login';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing hardcoded session
    const savedUser = localStorage.getItem('omni_user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('omni_user_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('omni_user_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('omni_user_session');
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {user ? (
          <>
            <Sidebar onLogout={handleLogout} user={user} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/whatsapp" element={<WhatsAppCRM />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
