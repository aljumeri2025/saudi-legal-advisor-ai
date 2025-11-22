import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Building2, Calendar, FileText, MessageSquare, Trash2, Inbox } from 'lucide-react';
import { getSuggestions, clearSuggestions } from '../services/suggestionsService';
import { Suggestion } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface SuggestionsListProps {
  onBack: () => void;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ onBack }) => {
  const { language, dir } = useLanguage();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    setSuggestions(getSuggestions());
  }, []);

  const handleClear = () => {
    if (window.confirm(t('deleteConfirm', language))) { // Reusing delete confirm
      clearSuggestions();
      setSuggestions([]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-gray-100 text-gray-500 hover:text-saudi-green rounded-full transition-all"
          >
            {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('suggestionTitle', language)}</h2>
            <p className="text-sm text-gray-500">{t('manageSuggestions', language)}</p>
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold"
          >
            <Trash2 size={16} />
            {t('clearAll', language)}
          </button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Inbox size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">{t('noSuggestions', language)}</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-saudi-green/10 text-saudi-green rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{suggestion.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {suggestion.sector && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <FileText size={12} />
                        <span>{suggestion.sector}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      <Calendar size={12} />
                      <span>{formatDate(suggestion.timestamp)}</span>
                    </div>
                  </div>
                  {suggestion.reason && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50">
                      <MessageSquare size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p>{suggestion.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};