import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, ArrowRight, Sparkles, Paperclip, X, 
  FileText, MoreVertical, Copy, Check, RotateCcw, 
  ThumbsUp, ThumbsDown, Share2, Save, Download
} from 'lucide-react';
import { Entity, Message, Attachment } from '../types';
import { sendMessageToGeminiStream } from '../services/geminiService';
import { saveSession } from '../services/storage';

interface ChatInterfaceProps {
  entity: Entity;
  onBack: () => void;
  initialMessage?: string;
  sessionId: string; // Required for tracking history
  initialMessages?: Message[]; // For loading history
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  entity, 
  onBack, 
  initialMessage, 
  sessionId,
  initialMessages 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavedIndicator, setIsSavedIndicator] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or Reload Messages
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: initialMessage || `مرحباً بك. أنا مساعدك الذكي المختص في ${entity.name}. كيف يمكنني خدمتك اليوم بخصوص الأنظمة واللوائح؟`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [sessionId, initialMessages, entity.name, initialMessage]);

  // Auto Save Effect
  useEffect(() => {
    const hasUserMessage = messages.some(m => m.role === 'user');
    if (hasUserMessage) {
      saveSession(sessionId, entity.id, messages);
    }
  }, [messages, sessionId, entity.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingAttachments, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.size > 10 * 1024 * 1024) {
          alert(`الملف ${file.name} أكبر من 10 ميجابايت`);
          continue;
        }

        try {
          let mimeType = file.type;
          let base64Data = '';

          if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
             try {
                const arrayBuffer = await fileToArrayBuffer(file);
                // @ts-ignore
                const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                base64Data = btoa(unescape(encodeURIComponent(result.value)));
                mimeType = 'text/plain';
             } catch (docxError) {
                console.error("Error parsing DOCX", docxError);
                alert(`تعذر قراءة ملف Word: ${file.name}`);
                continue;
             }
          } else {
             base64Data = await fileToBase64(file);
          }

          newAttachments.push({
            type: file.type.startsWith('image/') ? 'image' : 'file',
            mimeType: mimeType,
            data: base64Data,
            name: file.name
          });
        } catch (err) {
          console.error("Error reading file", err);
        }
      }
      setPendingAttachments(prev => [...prev, ...newAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const textContent = messages.map(m => {
        return `${m.role === 'user' ? 'أنت' : 'المستشار'} (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.text}\n-------------------\n`;
    }).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `محادثة-${entity.name}-${new Date().toLocaleDateString()}.txt`;
    a.click();
    
    setIsSavedIndicator(true);
    setTimeout(() => setIsSavedIndicator(false), 2000);
  };

  const handleSend = async () => {
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setPendingAttachments([]);
    setIsLoading(true);
    
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const stream = await sendMessageToGeminiStream(
        messages.filter(m => m.id !== 'welcome'), 
        userMessage.text,
        entity.systemInstruction,
        userMessage.attachments
      );

      setIsLoading(false);
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
      }]);

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text || '';
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsgIndex = newMessages.findIndex(m => m.id === botMsgId);
          if (lastMsgIndex !== -1) {
            newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], text: fullText };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "عذراً، حدث خطأ أثناء الاتصال بالمستشار الذكي. يرجى المحاولة مرة أخرى.",
        timestamp: Date.now(),
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] md:h-[650px] max-w-5xl mx-auto bg-white md:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 font-sans relative">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 108, 53, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 108, 53, 0.2);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-gray-100 text-gray-500 hover:text-saudi-green rounded-full transition-all duration-300 group"
            aria-label="Back"
          >
            <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${entity.colorClass} flex items-center justify-center shadow-md transform rotate-3`}>
              <entity.icon size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-800 leading-tight flex items-center gap-2">
                {entity.name}
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">مستشار ذكي - متصل الآن</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className={`p-2.5 text-gray-400 hover:bg-saudi-green/5 rounded-xl transition-all flex items-center gap-2 ${isSavedIndicator ? 'text-saudi-green' : 'hover:text-saudi-green'}`}
                title="تحميل المحادثة"
            >
                {isSavedIndicator ? <Check size={18} /> : <Download size={18} />}
                <span className="text-xs font-bold hidden sm:inline">{isSavedIndicator ? 'تم الحفظ' : 'حفظ'}</span>
            </button>
            <button 
                onClick={() => setMessages([messages[0]])}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="محو المحادثة"
            >
                <RotateCcw size={18} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 space-y-6 custom-scrollbar scroll-smooth">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex w-full animate-slide-up ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`flex flex-col max-w-[90%] md:max-w-[80%] gap-1 group`}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-auto border-2 border-white ${
                  msg.role === 'user' 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-gradient-to-br from-saudi-gold to-amber-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col gap-1 min-w-0">
                  
                  {/* Name & Time */}
                  <div className={`flex items-center gap-2 text-[10px] text-gray-400 px-1 ${
                      msg.role === 'user' ? 'justify-start' : 'justify-end'
                  }`}>
                    <span>{msg.role === 'user' ? 'أنت' : 'المستشار'}</span>
                    <span>•</span>
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>

                  {/* Message Body */}
                  <div className={`relative flex flex-col gap-2 p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                    msg.role === 'user'
                      ? 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tr-none'
                      : 'bg-gradient-to-br from-saudi-green to-saudi-dark text-white rounded-2xl rounded-tl-none'
                  }`}>
                    
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                       <div className="flex flex-wrap gap-2 mb-2">
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} className="relative overflow-hidden rounded-xl border border-white/20 bg-black/5">
                               {att.type === 'image' ? (
                                 <img 
                                   src={`data:${att.mimeType};base64,${att.data}`} 
                                   alt={att.name} 
                                   className="h-32 w-auto object-cover hover:scale-105 transition-transform duration-500"
                                 />
                               ) : (
                                 <div className="flex items-center gap-2 p-3 text-xs font-medium">
                                   <FileText size={16} />
                                   <span className="truncate max-w-[150px]">{att.name}</span>
                                 </div>
                               )}
                            </div>
                          ))}
                       </div>
                    )}

                    {/* Text Content */}
                    <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.text}
                      {msg.role === 'model' && msg.id === messages[messages.length - 1].id && !isLoading && msg.text.length < 1 && (
                         <span className="inline-block w-1.5 h-5 ml-1 bg-white/50 align-middle animate-pulse rounded-full"></span>
                      )}
                    </div>

                    {/* Message Actions (Only for Model) */}
                    {msg.role === 'model' && msg.text && (
                        <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                                onClick={() => handleCopy(msg.text, msg.id)}
                                className="p-2 bg-white text-gray-400 hover:text-saudi-green rounded-full shadow-sm border border-gray-100 transition-all"
                                title="نسخ النص"
                            >
                                {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    )}
                  </div>

                  {/* Feedback (Optional Visual) */}
                  {msg.role === 'model' && msg.text && index === messages.length - 1 && !isLoading && (
                      <div className="flex items-center gap-2 mt-1 px-1 opacity-50 hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-green-600 transition-colors">
                              <ThumbsUp size={12} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600 transition-colors">
                              <ThumbsDown size={12} />
                          </button>
                      </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-end w-full animate-slide-up">
            <div className="flex flex-col max-w-[85%] gap-1">
              <div className="flex flex-row-reverse gap-3">
                <div className="w-10 h-10 rounded-full bg-saudi-gold flex items-center justify-center shadow-sm animate-pulse">
                    <Sparkles size={18} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-saudi-gold/40 rounded-full animate-[bounce_1s_infinite_-0.3s]"></span>
                        <span className="w-2 h-2 bg-saudi-gold/70 rounded-full animate-[bounce_1s_infinite_-0.15s]"></span>
                        <span className="w-2 h-2 bg-saudi-gold rounded-full animate-[bounce_1s_infinite]"></span>
                    </div>
                    <span className="text-xs font-medium text-gray-400">جاري الصياغة...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-5 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
            {/* Pending Attachments */}
            {pendingAttachments.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-2 px-1 custom-scrollbar">
                {pendingAttachments.map((att, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group shadow-sm">
                    {att.type === 'image' ? (
                    <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400 p-2">
                        <FileText size={24} />
                        <span className="text-[8px] text-center truncate w-full">{att.name}</span>
                    </div>
                    )}
                    <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-500 rounded-full transition-all backdrop-blur-sm shadow-sm"
                    >
                    <X size={12} />
                    </button>
                </div>
                ))}
            </div>
            )}

            {/* Input Box - Completely Flat and Clean */}
            <div className="relative flex items-end gap-3 bg-gray-50 p-2 rounded-3xl">
                {/* Attachment Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-saudi-green hover:bg-white rounded-full transition-all duration-200 focus:outline-none"
                    title="إرفاق ملف"
                >
                    <Paperclip size={22} />
                </button>
                
                {/* Text Area */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك هنا..."
                    rows={1}
                    className="flex-grow w-full py-3 px-2 bg-transparent border-none focus:ring-0 outline-none text-gray-800 placeholder-gray-400 resize-none max-h-[150px] text-right leading-relaxed"
                    disabled={isLoading}
                />
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    onChange={handleFileSelect}
                />

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={(isLoading || (!input.trim() && pendingAttachments.length === 0))}
                    className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 flex items-center justify-center shadow-md ${
                    (isLoading || (!input.trim() && pendingAttachments.length === 0))
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed translate-y-0 shadow-none'
                        : 'bg-gradient-to-br from-saudi-green to-saudi-dark text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                    }`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send size={20} className="transform rotate-180 ml-0.5" /> 
                    )}
                </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2.5 font-medium">
            اضغط <span className="font-bold font-mono mx-0.5">Shift + Enter</span> للسطر الجديد
            </p>
        </div>
      </div>
    </div>
  );
};