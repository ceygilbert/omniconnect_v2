
import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppContact, ChatMessage, WhatsAppConfig } from '../types';
import { WhatsAppService } from '../services/whatsAppService';

const WhatsAppCRM: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(WhatsAppService.isConfigured());
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Setup State
  const [setupConfig, setSetupConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: ''
  });

  // Add Contact Modal State
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConfigured) {
      const savedContacts = WhatsAppService.getContacts();
      setContacts(savedContacts);
      if (savedContacts.length > 0) {
        handleSelectContact(savedContacts[0]);
      }
    }
  }, [isConfigured]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupConfig.phoneNumberId || !setupConfig.accessToken) return;
    WhatsAppService.saveConfig(setupConfig);
    setIsConfigured(true);
  };

  const handleSelectContact = (contact: WhatsAppContact) => {
    setSelectedContact(contact);
    setMessages(WhatsAppService.getHistory(contact.phone || ''));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    
    const contact: WhatsAppContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      lastMessage: 'Chat started',
      unreadCount: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newContact.name)}&background=random`
    };

    WhatsAppService.saveContact(contact);
    setContacts(WhatsAppService.getContacts());
    setShowAddContact(false);
    setNewContact({ name: '', phone: '' });
    handleSelectContact(contact);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput || !selectedContact || !selectedContact.phone || sending) return;

    setSending(true);
    setError(null);

    try {
      await WhatsAppService.sendMessage(selectedContact.phone, messageInput);
      
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      
      WhatsAppService.saveMessage(selectedContact.phone, newMsg);
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      
      // Update last message in list
      const updatedContact = { ...selectedContact, lastMessage: messageInput };
      WhatsAppService.saveContact(updatedContact);
      setContacts(WhatsAppService.getContacts());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-10 h-10" alt="WhatsApp" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Connect Meta Cloud API</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Enter your developer credentials to activate real-time messaging.</p>
          
          <form onSubmit={handleSaveSetup} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number ID</label>
              <input 
                required
                type="text" 
                value={setupConfig.phoneNumberId}
                onChange={e => setSetupConfig({...setupConfig, phoneNumberId: e.target.value})}
                placeholder="From App Dashboard"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Permanent Access Token</label>
              <input 
                required
                type="password" 
                value={setupConfig.accessToken}
                onChange={e => setSetupConfig({...setupConfig, accessToken: e.target.value})}
                placeholder="EAAB..."
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95"
            >
              Activate Live CRM
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">
            Need credentials? Visit the <a href="https://developers.facebook.com" className="text-emerald-600 font-bold underline">Meta Developer Portal</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 relative">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Real-Time Messaging</h2>
          <div className="flex items-center mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">Meta Cloud API Active</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if(window.confirm('Clear API configuration and disconnect?')) {
              localStorage.removeItem('omni_whatsapp_config');
              setIsConfigured(false);
            }
          }}
          className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
        >
          Disconnect API
        </button>
      </header>

      <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-sm border border-slate-100 flex overflow-hidden">
        {/* Contact Side Bar */}
        <div className="w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/30">
          <div className="p-4 border-b border-slate-100 bg-white">
            <button 
              onClick={() => setShowAddContact(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-100"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
              START NEW CHAT
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No active chats yet. Click above to start one.</p>
              </div>
            ) : (
              contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full flex items-center p-4 transition-all border-b border-slate-50 ${selectedContact?.id === contact.id ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'hover:bg-slate-100/50'}`}
                >
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-sm" />
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{contact.name}</h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{contact.lastMessage}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">+{contact.phone}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {!selectedContact ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20">
               <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-800">Select a recipient</h3>
               <p className="text-sm text-slate-400">Open a contact to view real-time conversation.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center">
                  <img src={selectedContact.avatar} className="w-10 h-10 rounded-full mr-3" alt="" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{selectedContact.name}</h4>
                    <p className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Live Connection</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                   <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono text-slate-500">+{selectedContact.phone}</div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#efe7dd] space-y-3 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
                {messages.length === 0 && (
                  <div className="flex justify-center mt-4">
                    <span className="bg-white/80 backdrop-blur px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">Encryption Validated</span>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`${msg.sender === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'} p-3 rounded-2xl max-w-[85%] shadow-sm border border-slate-200/20`}>
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                        {msg.sender === 'user' && (
                           <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 16 15" fill="none"><path d="M15.01 3.31L5.07 13.25l-4.08-4.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M11.01 3.31L6.07 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Error Popup */}
              {error && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-bold px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {error}
                  <button onClick={() => setError(null)} className="ml-3 hover:scale-110">✕</button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 bg-white border border-slate-200 rounded-3xl px-4 py-1 flex items-end">
                    <textarea 
                      rows={1}
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e as any);
                        }
                      }}
                      placeholder="Type a real WhatsApp message..."
                      className="flex-1 py-3 text-sm text-slate-900 focus:outline-none resize-none max-h-32 scrollbar-hide"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!messageInput || sending}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!messageInput || sending ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95'}`}
                  >
                    {sending ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-6 h-6 transform rotate-90 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-slate-100 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6">Start New Chat</h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Phone Number (with Country Code)</label>
                <input 
                  required
                  type="text" 
                  value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  placeholder="e.g. 15551234567"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddContact(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Add Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppCRM;
