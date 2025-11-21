import React, { useState, useMemo, useEffect } from 'react';
import { SAUDI_ENTITIES, PRIVATE_LAWYER_ENTITY, CLAIM_INSTRUCTION, DEFENSE_INSTRUCTION } from './constants';
import { Entity, SavedSession, Message } from './types';
import { EntityCard } from './components/EntityCard';
import { ChatInterface } from './components/ChatInterface';
import { LiveVoiceInterface } from './components/LiveVoiceInterface';
import { HistorySidebar } from './components/HistorySidebar';
import { Gavel, Search, ShieldCheck, Filter, Mic, FileSignature, Shield, ArrowLeft, Clock, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showLawyerOptions, setShowLawyerOptions] = useState(false);
  const [lawyerInitialMessage, setLawyerInitialMessage] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  
  // History & Session Management
  const [showHistory, setShowHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  const [loadedMessages, setLoadedMessages] = useState<Message[] | undefined>(undefined);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(SAUDI_ENTITIES.map(e => e.category)));
    return ['الكل', ...cats];
  }, []);

  // Filter entities based on search and category
  const filteredEntities = SAUDI_ENTITIES.filter(entity => {
    const matchesSearch = entity.name.includes(searchTerm) || entity.description.includes(searchTerm);
    const matchesCategory = selectedCategory === 'الكل' || entity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowLawyerOptions(false);
    setLawyerInitialMessage(undefined);
    setCurrentSessionId(Date.now().toString()); // Start fresh session
    setLoadedMessages(undefined);
  };

  const handleBack = () => {
    // If currently in a lawyer chat, go back to options
    if (selectedEntity?.id === PRIVATE_LAWYER_ENTITY.id) {
        setSelectedEntity(null);
        setShowLawyerOptions(true);
    } else if (selectedEntity) {
        setSelectedEntity(null);
    } else if (showLawyerOptions) {
        setShowLawyerOptions(false);
    }
    setLoadedMessages(undefined);
  };

  const startPrivateLawyer = () => {
    setShowLawyerOptions(true);
    setSelectedEntity(null);
  };

  const selectLawyerTask = (task: 'claim' | 'defense') => {
    const isClaim = task === 'claim';
    const entity: Entity = {
        ...PRIVATE_LAWYER_ENTITY,
        name: isClaim ? 'المحامي - صياغة الدعوى' : 'المحامي - الدفاع والرد',
        icon: isClaim ? FileSignature : ShieldCheck,
        systemInstruction: isClaim ? CLAIM_INSTRUCTION : DEFENSE_INSTRUCTION
    };
    
    const welcome = isClaim 
        ? "أهلاً بك. بصفتي محاميك الخاص، سأقوم بكتابة **لائحة الدعوى** لك. لضمان صياغة قانونية رصينة، سأطرح عليك بعض الأسئلة لجمع التفاصيل. هل أنت جاهز؟ لنبدأ بذكر صفة المدعي والمدعى عليه."
        : "أهلاً بك. بصفتي محاميك الخاص، سأقوم بصياغة **مذكرة الرد (الدفاع)**. يرجى تزويدي بلائحة الدعوى المقامة ضدك (كنص أو ملف) أو شرح ملخص لها، لأبدأ بدراسة الثغرات والدفوع.";

    setLawyerInitialMessage(welcome);
    setSelectedEntity(entity);
    setShowLawyerOptions(false);
    setCurrentSessionId(Date.now().toString());
    setLoadedMessages(undefined);
  };

  const handleSelectFromHistory = (session: SavedSession) => {
    // Find the entity
    let entity = [...SAUDI_ENTITIES, PRIVATE_LAWYER_ENTITY].find(e => e.id === session.entityId);
    
    // Special handling for private lawyer variants
    if (session.entityId === PRIVATE_LAWYER_ENTITY.id) {
         // Determine if it was claim or defense based on first message maybe, 
         // or just fallback to generic private lawyer.
         // For simplicity, we restore generic private lawyer, or infer from title/instructions if we stored them.
         // Since we don't store full entity object, we revert to base. 
         // *Improvement*: In a real app, store the specific "sub-mode" in the session.
         entity = PRIVATE_LAWYER_ENTITY;
    }

    if (entity) {
        setSelectedEntity(entity);
        setCurrentSessionId(session.id);
        setLoadedMessages(session.messages);
        setShowHistory(false);
        setShowLawyerOptions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
      
      <HistorySidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        onSelectSession={handleSelectFromHistory}
        currentSessionId={currentSessionId}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(true)} className="p-2 text-gray-500 hover:text-saudi-green hover:bg-saudi-green/5 rounded-full transition-all md:hidden">
                <Menu size={24} />
            </button>

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => {setSelectedEntity(null); setShowLawyerOptions(false);}}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg" alt="Saudi Flag" className="h-8 w-auto border border-gray-100 shadow-sm rounded-sm" />
                <div className="text-right hidden sm:block">
                <h1 className="text-xl font-bold text-saudi-green tracking-tight">المستشار السعودي</h1>
                <p className="text-[10px] text-gray-500 -mt-1">بوابتك للأنظمة والقوانين</p>
                </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-saudi-green px-3 py-2 rounded-full hover:bg-gray-50 transition-all"
            >
              <Clock size={18} />
              <span className="text-sm font-medium">السجل</span>
            </button>

            <button 
              onClick={() => setShowVoiceInterface(true)}
              className="hidden md:flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
            >
              <Mic size={18} className="text-saudi-green" />
              <span className="text-sm font-medium">مكالمة صوتية</span>
            </button>

            <button 
              onClick={startPrivateLawyer}
              className={`group flex items-center gap-2 bg-gradient-to-r from-saudi-gold to-amber-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ${showLawyerOptions || (selectedEntity?.id === PRIVATE_LAWYER_ENTITY.id) ? 'ring-2 ring-offset-2 ring-saudi-gold' : 'hover:scale-105'}`}
            >
              <Gavel size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold hidden sm:inline">محاميك الخاص</span>
              <span className="text-sm font-bold sm:hidden">المحامي</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        
        {/* Voice Interface Overlay */}
        {showVoiceInterface && (
          <LiveVoiceInterface onClose={() => setShowVoiceInterface(false)} />
        )}

        {selectedEntity ? (
          // View: Chat Interface
          <div className="animate-fadeInUp">
             <ChatInterface 
                key={currentSessionId} // Force re-render when session changes
                entity={selectedEntity} 
                onBack={handleBack}
                initialMessage={lawyerInitialMessage}
                sessionId={currentSessionId}
                initialMessages={loadedMessages}
             />
          </div>
        ) : showLawyerOptions ? (
          // View: Private Lawyer Selection
          <div className="max-w-4xl mx-auto animate-fadeIn">
             <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-saudi-gold/10 text-saudi-gold px-4 py-2 rounded-full mb-4 border border-saudi-gold/20">
                  <Gavel size={20} />
                  <span className="font-bold">خدمة المحامي الخاص</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">ما هي الخدمة التي تحتاجها اليوم؟</h2>
                <p className="text-gray-500 max-w-lg mx-auto text-lg">
                   سأساعدك في صياغة مستنداتك القانونية باحترافية عالية استناداً للأنظمة السعودية. اختر مسارك لنبدأ.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Option 1: Claim (Plaintiff) */}
                <button 
                  onClick={() => selectLawyerTask('claim')}
                  className="group relative flex flex-col justify-between h-full bg-white border border-gray-200 rounded-3xl p-8 text-right overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100/20 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
                   
                   <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                              <FileSignature size={28} />
                          </div>
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">للمدعي</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-amber-700 transition-colors">كتابة لائحة دعوى</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                         صياغة صحيفة دعوى احترافية ومكتملة الأركان، مدعمة بالأسانيد الشرعية والمواد النظامية لتقديمها للمحكمة.
                      </p>
                      
                      <div className="flex items-center justify-end text-amber-600 font-bold text-sm group-hover:gap-2 transition-all">
                         <span>بدء الصياغة</span>
                         <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                      </div>
                   </div>
                </button>

                {/* Option 2: Defense (Defendant) */}
                <button 
                   onClick={() => selectLawyerTask('defense')}
                   className="group relative flex flex-col justify-between h-full bg-white border border-gray-200 rounded-3xl p-8 text-right overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-100/20 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>

                   <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                              <ShieldCheck size={28} />
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">للمدعى عليه</span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors">الرد على دعوى</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                         إعداد مذكرة رد جوابية للدفاع عن حقوقك، وتفنيد ادعاءات الخصم بالدفوع الشكلية والموضوعية.
                      </p>
                      
                      <div className="flex items-center justify-end text-emerald-600 font-bold text-sm group-hover:gap-2 transition-all">
                         <span>بدء الدفاع</span>
                         <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                      </div>
                   </div>
                </button>
             </div>
             
             <div className="mt-10 text-center">
                <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 text-sm underline">
                   العودة للقائمة الرئيسية
                </button>
             </div>
          </div>
        ) : (
          // View: Home / Entity Grid
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero Section */}
            <div className="text-center space-y-4 py-6 md:py-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-saudi-green/5 text-saudi-green rounded-full text-sm font-medium mb-2 border border-saudi-green/10">
                <ShieldCheck size={16} />
                <span>منصة قانونية شاملة مدعومة بالذكاء الاصطناعي</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                دليلك القانوني الشامل
                <br />
                <span className="text-saudi-green">لكل الجهات الحكومية</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                اختر الجهة المختصة، واسأل عن الأنظمة، اللوائح، والحقوق.
                <br />
                إجابات دقيقة مبنية على أحدث الأنظمة السعودية.
              </p>
              
              {/* Mobile Voice Button */}
              <button 
                onClick={() => setShowVoiceInterface(true)}
                className="md:hidden w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl shadow-sm hover:bg-gray-50 transition-all"
              >
                <Mic size={20} className="text-saudi-green" />
                <span className="font-bold">بدء مكالمة صوتية</span>
              </button>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto mt-8 group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-saudi-green transition-colors">
                  <Search size={22} />
                </div>
                <input 
                  type="text" 
                  placeholder="ابحث عن جهة (مثل: العمل، المرور، التجارة...)"
                  className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-saudi-green/20 focus:border-saudi-green shadow-sm transition-all text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 px-1">
                <Filter size={14} />
                <span>تصفح حسب القطاع:</span>
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
                    {cat}
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
                  <p className="text-lg">عذراً، لا توجد جهات تطابق بحثك</p>
                  <button 
                    onClick={() => {setSearchTerm(''); setSelectedCategory('الكل');}}
                    className="mt-4 text-saudi-green hover:underline"
                  >
                    عرض جميع الجهات
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} منصة المستشار القانوني السعودي.
            <br />
            <span className="text-xs opacity-70">نظام ذكي للمساعدة في فهم الأنظمة واللوائح السعودية</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
