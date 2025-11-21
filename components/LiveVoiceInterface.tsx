import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Activity, Volume2, Loader2 } from 'lucide-react';

interface LiveVoiceInterfaceProps {
  onClose: () => void;
}

// Audio context configurations
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export const LiveVoiceInterface: React.FC<LiveVoiceInterfaceProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  // Refs for cleanup
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key not found");

        const ai = new GoogleGenAI({ apiKey });

        // Initialize Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
        const outputCtx = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
        
        audioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Connect to Gemini Live
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              if (!mounted) return;
              setStatus('connected');
              
              // Setup Input Processing
              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              sourceRef.current = source;
              processorRef.current = processor;

              processor.onaudioprocess = (e) => {
                if (isMuted) return; // Don't send audio if muted
                
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Calculate volume for visualization
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                  sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                setVolumeLevel(Math.min(rms * 5, 1)); // Normalize a bit

                const pcmBlob = createBlob(inputData);
                
                sessionPromise.then((session: any) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(processor);
              processor.connect(inputCtx.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (!mounted) return;

              // Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && outputCtx) {
                try {
                  // Update next start time to ensure smooth playback
                  nextStartTimeRef.current = Math.max(
                    nextStartTimeRef.current,
                    outputCtx.currentTime
                  );

                  const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    outputCtx,
                    OUTPUT_SAMPLE_RATE,
                    1
                  );

                  const source = outputCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputCtx.destination);
                  
                  source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                  });

                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  audioSourcesRef.current.add(source);
                } catch (err) {
                  console.error("Error decoding audio:", err);
                }
              }

              // Handle Interruption
              if (message.serverContent?.interrupted) {
                audioSourcesRef.current.forEach(src => {
                  try { src.stop(); } catch (e) {}
                });
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onclose: () => {
              console.log("Session closed");
            },
            onerror: (err) => {
              console.error("Session error:", err);
              if (mounted) setStatus('error');
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
            },
            systemInstruction: "أنت مستشار قانوني سعودي (رجل). تحدث بنبرة صوتية رزينة ومهنية. استخدم اللهجة السعودية البيضاء والمصطلحات القانونية الدقيقة عند الحاجة. هدفك هو مساعدة المستخدم صوتياً.",
          },
        });

        sessionPromiseRef.current = sessionPromise;

      } catch (err) {
        console.error("Failed to initialize voice session", err);
        setStatus('error');
      }
    };

    startSession();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  // Toggle Mute effect
  useEffect(() => {
    if (processorRef.current && isMuted) {
       // Logic handled in onaudioprocess (skipping send)
       setVolumeLevel(0);
    }
  }, [isMuted]);

  const cleanup = () => {
    // Close session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session: any) => {
          try { session.close(); } catch(e) {}
      });
    }

    // Stop tracks
    streamRef.current?.getTracks().forEach(track => track.stop());

    // Stop audio processing
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    
    // Close Audio Contexts safely
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
    }

    // Stop playing audio
    audioSourcesRef.current.forEach(src => {
        try { src.stop(); } catch (e) {}
    });
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-saudi-dark/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-fadeIn">
      
      {/* Header */}
      <div className="absolute top-6 w-full px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 opacity-80">
          <Activity size={18} className={status === 'connected' ? 'text-green-400' : 'text-gray-400'} />
          <span className="text-sm font-medium">
            {status === 'connecting' ? 'جاري الاتصال...' : status === 'connected' ? 'متصل - مباشر' : 'خطأ في الاتصال'}
          </span>
        </div>
        <button onClick={handleClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <span className="sr-only">إغلاق</span>
          <XIcon />
        </button>
      </div>

      {/* Main Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 relative">
        
        {/* Pulse Rings */}
        <div className="relative">
          {status === 'connected' && (
            <>
              <div className="absolute inset-0 bg-saudi-green rounded-full opacity-20 animate-ping" style={{ transform: `scale(${1 + volumeLevel})` }}></div>
              <div className="absolute inset-0 bg-saudi-gold rounded-full opacity-10 animate-pulse delay-75" style={{ transform: `scale(${1.2 + volumeLevel})` }}></div>
            </>
          )}
          
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
            status === 'connected' ? 'bg-gradient-to-br from-saudi-green to-saudi-dark shadow-2xl shadow-saudi-green/50' : 'bg-gray-700'
          }`}>
            {status === 'connecting' ? (
              <Loader2 size={40} className="animate-spin text-white/50" />
            ) : (
              <Volume2 size={48} className={`text-white transition-opacity duration-200 ${volumeLevel > 0.1 ? 'opacity-100' : 'opacity-70'}`} />
            )}
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-center">المستشار الصوتي</h2>
        <p className="mt-2 text-white/60 text-center">
          {status === 'connected' 
            ? 'تحدث الآن، أنا استمع إليك...' 
            : status === 'error' 
            ? 'تعذر الوصول للميكروفون أو حدث خطأ' 
            : 'جاري إعداد الجلسة...'}
        </p>
      </div>

      {/* Controls */}
      <div className="pb-12 flex items-center gap-6">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-5 rounded-full transition-all duration-300 ${
            isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={handleClose}
          className="p-5 bg-red-500 rounded-full text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transform hover:scale-105 transition-all duration-300"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};

// Helper Icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);

// --- Audio Helpers ---

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}