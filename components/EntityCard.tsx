
import React from 'react';
import { Entity } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface EntityCardProps {
  entity: Entity;
  onClick: (entity: Entity) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onClick }) => {
  const { language, dir } = useLanguage();
  const Icon = entity.icon;

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <button
      onClick={() => onClick(entity)}
      className={`group relative flex flex-col items-start p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-saudi-green/30 transition-all duration-300 w-full h-full hover:-translate-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
    >
      <div className="flex justify-between w-full items-start mb-4">
        <div className={`p-3 rounded-xl ${entity.colorClass} bg-opacity-10`}>
          <Icon size={24} className={entity.colorClass.split(' ')[1]} />
        </div>
        <span className="text-[10px] font-medium px-2 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100">
          {entity.category}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-saudi-green transition-colors">
        {entity.name}
      </h3>
      
      <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-3">
        {entity.description}
      </p>

      {entity.website && (
        <a 
          href={entity.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-saudi-gold transition-colors mb-4 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100"
          title={language === 'ar' ? 'زيارة الموقع الرسمي' : 'Visit official website'}
        >
          <ExternalLink size={10} />
          <span dir="ltr" className="font-mono tracking-tight">{getDomain(entity.website)}</span>
        </a>
      )}
      
      <div className="w-full flex items-center justify-between text-saudi-green font-medium text-xs mt-auto pt-4 border-t border-gray-50 group-hover:border-saudi-green/10 transition-colors">
        <span>{t('startConversation', language)}</span>
        <div className="bg-saudi-green/10 p-1 rounded-full group-hover:bg-saudi-green group-hover:text-white transition-all">
            {dir === 'rtl' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>
    </button>
  );
};
