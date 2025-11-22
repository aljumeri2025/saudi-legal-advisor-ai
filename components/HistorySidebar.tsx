import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, Search, Clock } from 'lucide-react';
import { SavedSession } from '../types';
import { getHistory, deleteSession } from '../services/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: SavedSession) => void;
  currentSessionId?: string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  onSelectSession,
  currentSessionId 
}) => {
  const { language, dir } = useLanguage();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSessions(getHistory());
    }
  }, [isOpen, currentSessionId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(t('deleteConfirm', language))) {
      const updated = deleteSession(id);
      setSessions(updated);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';

    if (diffDays === 0) {
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return language === 'ar' ? 'أمس' : 'Yesterday';
    } else {
        return date.toLocaleDateString(locale);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-saudi-green" />
            {t('historyTitle', language)}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={16} className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
            <input 
              type="text" 
              placeholder={t('historySearch', language)}
              className={`w-full ${dir === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-saudi-green/20 focus:border-saudi-green outline-none transition-all`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-4">
              <MessageSquare size={48} className="mb-3 opacity-20" />
              <p className="text-sm">{t('noHistory', language)}</p>
            </div>
          ) : (
            filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`group relative w-full ${dir === 'rtl' ? 'text-right' : 'text-left'} p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id 
                    ? 'bg-saudi-green/5 border-saudi-green/30 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`flex justify-between items-start mb-2 ${dir === 'rtl' ? 'pl-8' : 'pr-8'}`}>
                  <h3 className={`font-bold text-sm truncate max-w-[70%] ${currentSessionId === session.id ? 'text-saudi-green' : 'text-gray-800'}`}>
                      {session.title}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full">
                      {formatTime(session.lastModified)}
                  </span>
                </div>
                
                <p className={`text-xs text-gray-500 truncate ${dir === 'rtl' ? 'pl-6' : 'pr-6'} opacity-80 font-medium`}>
                  {session.preview}
                </p>

                {/* Delete Button */}
                <button 
                  onClick={(e) => handleDelete(e, session.id)}
                  className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100`}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center bg-gray-50/30">
            <p className="text-[10px] text-gray-400">{t('localHistoryNote', language)}</p>
        </div>
      </div>
    </>
  );
};