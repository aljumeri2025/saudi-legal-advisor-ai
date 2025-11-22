import React, { useState } from 'react';
import { X, Send, Building2, FileText, HelpCircle, CheckCircle } from 'lucide-react';
import { addSuggestion } from '../services/suggestionsService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface SuggestionModalProps {
  onClose: () => void;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({ onClose }) => {
  const { language, dir } = useLanguage();
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSuggestion({
      name,
      sector,
      reason
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-slide-up">
        
        <button 
          onClick={onClose}
          className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors`}
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{t('successSent', language)}</h3>
            <p className="text-gray-500">{t('successMsg', language)}</p>
          </div>
        ) : (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-saudi-green/10 text-saudi-green rounded-xl mb-4">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('suggestModalTitle', language)}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('suggestModalDesc', language)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('entityName', language)} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saudi-green/20 focus:border-saudi-green outline-none transition-all ${dir === 'rtl' ? 'pl-10' : 'pr-10'}`}
                  />
                  <Building2 size={18} className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3.5 text-gray-400`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('sector', language)} ({t('optional', language)})</label>
                <div className="relative">
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saudi-green/20 focus:border-saudi-green outline-none transition-all ${dir === 'rtl' ? 'pl-10' : 'pr-10'}`}
                  />
                  <FileText size={18} className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3.5 text-gray-400`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('reason', language)} ({t('optional', language)})</label>
                <div className="relative">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saudi-green/20 focus:border-saudi-green outline-none transition-all resize-none ${dir === 'rtl' ? 'pl-10' : 'pr-10'}`}
                  />
                  <HelpCircle size={18} className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3.5 text-gray-400`} />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-saudi-green text-white py-3.5 rounded-xl font-bold hover:bg-saudi-dark shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span>{t('submit', language)}</span>
                <Send size={18} className={`transform ${dir === 'rtl' ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};