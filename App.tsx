import React, { useState, useMemo, useEffect } from 'react';
import { 
  CLAIM_INSTRUCTION_AR, CLAIM_INSTRUCTION_EN, 
  DEFENSE_INSTRUCTION_AR, DEFENSE_INSTRUCTION_EN, 
  getEntities, getPrivateLawyerEntity 
} from './constants';
import { Entity, SavedSession, Message, AppView } from './types';
import { EntityCard } from './components/EntityCard';
import { ChatInterface } from './components/ChatInterface';
import { LiveVoiceInterface } from './components/LiveVoiceInterface';
import { HistorySidebar } from './components/HistorySidebar';
import { SuggestionModal } from './components/SuggestionModal';
import { SuggestionsList } from './components/SuggestionsList';
import { Gavel, Search, ShieldCheck, Filter, Mic, FileSignature, ArrowLeft, Clock, Menu, PlusCircle, Settings, Globe, ArrowRight } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { t } from './i18n/translations';

const AppContent: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showLawyerOptions, setShowLawyerOptions] = useState(false);
  const [lawyerInitialMessage, setLawyerInitialMessage] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  
  const [showHistory, setShowHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  const [loadedMessages, setLoadedMessages] = useState<Message[] | undefined>(undefined);

  // Get localized entities
  const entities = useMemo(() => getEntities(language), [language]);
  const privateLawyer = useMemo(() => getPrivateLawyerEntity(language), [language]);

  // Reset category and search when language changes to prevent empty grid
  useEffect(() => {
    setSelectedCategory('all');
    setSearchTerm('');
  }, [language]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(entities.map(e => e.category)));
    return ['all', ...cats];
  }, [entities]);

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         entity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowLawyerOptions(false);
    setLawyerInitialMessage(undefined);
    setCurrentSessionId(Date.now().toString()); 
    setLoadedMessages(undefined);
    setCurrentView('chat');
  };

  const handleBack = () => {
    if (selectedEntity?.id === privateLawyer.id) {
        setSelectedEntity(null);
        setShowLawyerOptions(true);
        setCurrentView('home');
    } else {
        setSelectedEntity(null);
        setShowLawyerOptions(false);
        setCurrentView('home');
    }
    setLoadedMessages(undefined);
  };

  const startPrivateLawyer = () => {
    setShowLawyerOptions(true);
    setSelectedEntity(null);
    setCurrentView('home');
  };

  const selectLawyerTask = (task: 'claim' | 'defense') => {
    const isClaim = task === 'claim';
    const isAr = language === 'ar';
    
    const entity: Entity = {
        ...privateLawyer,
        name: isClaim 
          ? (isAr ? 'المحامي - صياغة الدعوى' : 'Lawyer - Statement of Claim') 
          : (isAr ? 'المحامي - الدفاع والرد' : 'Lawyer - Defense Memo'),
        icon: isClaim ? FileSignature : ShieldCheck,
        systemInstruction: isClaim 
          ? (isAr ? CLAIM_INSTRUCTION_AR : CLAIM_INSTRUCTION_EN)
          : (isAr ? DEFENSE_INSTRUCTION_AR : DEFENSE_INSTRUCTION_EN)
    };
    
    const welcome = isClaim 
        ? (isAr 
            ? "أهلاً بك. بصفتي محاميك الخاص، سأقوم بكتابة **لائحة الدعوى** لك. لضمان صياغة قانونية رصينة، سأطرح عليك بعض الأسئلة لجمع التفاصيل. هل أنت جاهز؟ لنبدأ بذكر صفة المدعي والمدعى عليه."
            : "Welcome. As your private lawyer, I will draft a **Statement of Claim** for you. To ensure a solid legal draft, I will ask you some questions to gather details. Are you ready? Let's start with the Plaintiff and Defendant roles.")
        : (isAr
            ? "أهلاً بك. بصفتي محاميك الخاص، سأقوم بصياغة **مذكرة الرد (الدفاع)**. يرجى تزويدي بلائحة الدعوى المقامة ضدك (كنص أو ملف) أو شرح ملخص لها."
            : "Welcome. As your private lawyer, I will draft a **Defense Memo**. Please provide the claim statement filed against you (text or file) or a summary of it.");

    setLawyerInitialMessage(welcome);
    setSelectedEntity(entity);
    setShowLawyerOptions(false);
    setCurrentSessionId(Date.now().toString());
    setLoadedMessages(undefined);
    setCurrentView('chat');
  };

  const handleSelectFromHistory = (session: SavedSession) => {
    // Need to find entity in current language list by ID
    let entity = [...entities, privateLawyer].find(e => e.id === session.entityId);
    
    if (session.entityId === privateLawyer.id) {
         entity = privateLawyer;
    }

    if (entity) {
        setSelectedEntity(entity);
        setCurrentSessionId(session.id);
        setLoadedMessages(session.messages);
        setShowHistory(false);
        setShowLawyerOptions(false);
        setCurrentView('chat');
    }
  };

  const renderContent = () => {
    if (currentView === 'admin') {
      return <SuggestionsList onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'chat' && selectedEntity) {
      return (
        <div className="animate-fadeInUp">
          <ChatInterface 
             key={currentSessionId}
             entity={selectedEntity} 
             onBack={handleBack}
             initialMessage={lawyerInitialMessage}
             sessionId={currentSessionId}
             initialMessages={loadedMessages}
          />
       </div>
      );
    }

    if (showLawyerOptions) {
      return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
             <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-saudi-gold/10 text-saudi-gold px-4 py-2 rounded-full mb-4 border border-saudi-gold/20">
                  <Gavel size={20} />
                  <span className="font-bold">{t('lawyerServiceLabel', language)}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('lawyerServiceTitle', language)}</h2>
                <p className="text-gray-500 max-w-lg mx-auto text-lg">
                   {t('lawyerServiceDesc', language)}
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Option 1: Claim */}
                <button 
                  onClick={() => selectLawyerTask('claim')}
                  className={`group relative flex flex-col justify-between h-full bg-white border border-gray-200 rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <div className="relative z-10 flex flex-col h-full w-full">
                      <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                              <FileSignature size={28} />
                          </div>
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">{t('claimBadge', language)}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-amber-700 transition-colors">{t('claimTitle', language)}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                         {t('claimDesc', language)}
                      </p>
                      
                      <div className={`flex items-center ${dir === 'rtl' ? 'justify-end' : 'justify-start'} text-amber-600 font-bold text-sm group-hover:gap-2 transition-all`}>
                         <span>{t('startClaim', language)}</span>
                         {dir === 'rtl' ? (
                            <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                         ) : (
                            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                         )}
                      </div>
                   </div>
                </button>

                {/* Option 2: Defense */}
                <button 
                   onClick={() => selectLawyerTask('defense')}
                   className={`group relative flex flex-col justify-between h-full bg-white border border-gray-200 rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                   <div className="relative z-10 flex flex-col h-full w-full">
                      <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                              <ShieldCheck size={28} />
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">{t('defenseBadge', language)}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors">{t('defenseTitle', language)}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                         {t('defenseDesc', language)}
                      </p>
                      
                      <div className={`flex items-center ${dir === 'rtl' ? 'justify-end' : 'justify-start'} text-emerald-600 font-bold text-sm group-hover:gap-2 transition-all`}>
                         <span>{t('startDefense', language)}</span>
                         {dir === 'rtl' ? (
                            <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                         ) : (
                            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                         )}
                      </div>
                   </div>
                </button>
             </div>
             
             <div className="mt-10 text-center">
                <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 text-sm underline">
                   {t('backToHome', language)}
                </button>
             </div>
          </div>
      );
    }

    // Default: Home View
    return (
      <div className="space-y-8 animate-fadeIn">
            
            {/* Hero Section */}
            <div className="text-center space-y-4 py-6 md:py-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-saudi-green/5 text-saudi-green rounded-full text-sm font-medium mb-2 border border-saudi-green/10">
                <ShieldCheck size={16} />
                <span>{t('heroTagline', language)}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                {t('heroTitle', language)}
                <br />
                <span className="text-saudi-green">{t('heroTitleHighlight', language)}</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                {t('heroDesc', language)}
              </p>
              
              <div className="flex flex-col md:flex-row justify-center gap-3 mt-6">
                <button 
                    onClick={() => setShowVoiceInterface(true)}
                    className="md:hidden w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-[#F3F4F6] text-gray-700 px-6 py-3 rounded-2xl shadow-sm hover:bg-gray-200 transition-all"
                >
                    <span className="font-bold">{t('startVoiceCall', language)}</span>
                    <Mic size={20} className="text-saudi-green" strokeWidth={2.5} />
                </button>
                
                <button
                    onClick={() => setShowSuggestionModal(true)}
                    className="flex items-center justify-center gap-2 text-saudi-green bg-saudi-green/5 border border-saudi-green/10 px-6 py-3 rounded-2xl hover:bg-saudi-green/10 transition-all font-bold text-sm"
                >
                    <PlusCircle size={18} />
                    <span>{t('suggestEntity', language)}</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto mt-8 group">
                <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none text-gray-400 group-focus-within:text-saudi-green transition-colors`}>
                  <Search size={22} />
                </div>
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder', language)}
                  className={`w-full ${dir === 'rtl' ? 'pl-12 pr-4' : 'pr-12 pl-4'} py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-saudi-green/20 focus:border-saudi-green shadow-sm transition-all text-lg`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 px-1">
                <Filter size={14} />
                <span>{t('browseBySector', language)}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-saudi-green text-white shadow-md transform scale-105'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {cat === 'all' ? t('categoryAll', language) : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
              {filteredEntities.map((entity) => (
                <EntityCard 
                  key={entity.id} 
                  entity={entity} 
                  onClick={handleEntitySelect} 
                />
              ))}
              
              {filteredEntities.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="text-lg">{t('noResults', language)}</p>
                  <button 
                    onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}
                    className="mt-4 text-saudi-green hover:underline"
                  >
                    {t('showAll', language)}
                  </button>
                </div>
              )}
            </div>
          </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir={dir}>
      
      <HistorySidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        onSelectSession={handleSelectFromHistory}
        currentSessionId={currentSessionId}
      />

      {showSuggestionModal && (
        <SuggestionModal onClose={() => setShowSuggestionModal(false)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Right Side (Logo) - Mobile Menu */}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(true)} className="p-2 text-gray-500 hover:text-saudi-green hover:bg-saudi-green/5 rounded-full transition-all md:hidden">
                <Menu size={24} />
            </button>

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => {setSelectedEntity(null); setShowLawyerOptions(false); setCurrentView('home');}}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg" alt="Saudi Flag" className="h-8 w-auto border border-gray-100 shadow-sm rounded-sm" />
                <div className={`text-${dir === 'rtl' ? 'right' : 'left'} hidden sm:block`}>
                   <h1 className="text-xl font-bold text-saudi-green tracking-tight">{t('appTitle', language)}</h1>
                </div>
            </button>
          </div>

          {/* Left Side (Controls) - Order: Lawyer -> Voice -> History -> Language */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Private Lawyer (Gold Pill) */}
            <button 
              onClick={startPrivateLawyer}
              className="hidden md:flex items-center gap-2 bg-[#C8A051] hover:bg-[#B89041] text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="font-bold text-sm">{t('privateLawyer', language)}</span>
              <Gavel size={20} strokeWidth={2.5} className="text-white" />
            </button>

            {/* Voice Call (Gray Pill) */}
            <button 
              onClick={() => setShowVoiceInterface(true)}
              className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-2 rounded-full transition-all group shadow-sm"
            >
              <span className="font-bold text-sm">{t('voiceCall', language)}</span>
              <Mic size={20} className="text-saudi-green group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            </button>

            {/* History (Text & Icon) */}
            <button 
              onClick={() => setShowHistory(true)}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm transition-colors"
            >
              <span>{t('history', language)}</span>
              <Clock size={20} strokeWidth={2.5} />
            </button>

             {/* Language (Corner) */}
             <button 
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm pl-2 border-l border-gray-200 md:border-none md:pl-0"
            >
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
              <Globe size={20} strokeWidth={2.5} />
            </button>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {showVoiceInterface && (
          <LiveVoiceInterface onClose={() => setShowVoiceInterface(false)} />
        )}

        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {t('footerText', language)}
            <br />
            <span className="text-xs opacity-70">{t('footerSubText', language)}</span>
          </p>
          
          {/* Admin Link */}
          <button 
             onClick={() => setCurrentView('admin')}
             className="mt-4 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-saudi-green transition-colors"
          >
             <Settings size={12} />
             <span>{t('manageSuggestions', language)}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;