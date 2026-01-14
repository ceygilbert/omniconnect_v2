
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, user }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Marketing & Ads', path: '/marketing', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'WhatsApp CRM', path: '/whatsapp', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { name: 'Connections', path: '/connections', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white h-screen flex flex-col shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-100 flex items-center">
          <span className="bg-white text-indigo-900 rounded-lg w-8 h-8 flex items-center justify-center mr-2">O</span>
          OmniConnect
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-700 text-white shadow-lg' 
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 bg-indigo-950/50">
        <div className="flex items-center px-4 py-3 mb-4 rounded-xl bg-indigo-800/30">
          <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-indigo-900 font-bold mr-3">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-indigo-300 truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors border border-indigo-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
