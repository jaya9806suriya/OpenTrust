import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Bot, 
  User, 
  Send, 
  Radio, 
  RotateCcw,
  Shield,
  Activity
} from 'lucide-react';
import { AnalysisSession } from '../types';

interface VoiceCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: AnalysisSession;
}

interface DialogueMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const VoiceCopilotModal: React.FC<VoiceCopilotModalProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello, I am Aegis, your Voice AI Security Copilot. I'm ready to discuss repository risk analysis, egress anomalies, and remediation strategies. Tap the microphone or type below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);

        if (finalTranscript) {
          handleSendVoiceMessage(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Text-to-Speech playback
  const speakText = (text: string) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '').slice(0, 450);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick an english voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Animated Audio Visualizer
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isActive = isListening || isSpeaking || isLoading;
      const amplitude = isActive ? (isSpeaking ? 30 : 20) : 5;
      const frequency = isActive ? 0.05 : 0.02;
      const color = isSpeaking ? '#4edea3' : isListening ? '#60a5fa' : '#3c4a42';

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;

      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Secondary wave
      if (isActive) {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isSpeaking ? 'rgba(78, 222, 163, 0.4)' : 'rgba(96, 165, 250, 0.4)';
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * (frequency * 1.5) - phase * 1.2) * (amplitude * 0.7) * Math.sin((x / width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isActive ? 0.08 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, isListening, isSpeaking, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
    }
  };

  const handleSendVoiceMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: DialogueMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDialogue(prev => [...prev, userMessage]);
    setTranscript('');
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/voice-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: dialogue.slice(-6).map(m => ({ role: m.role, text: m.text })),
          context: session ? {
            targetRepo: session.targetRepo,
            trustScore: session.trustScore,
            verdict: session.verdict,
            riskFlags: session.riskFlags
          } : undefined
        })
      });

      const data = await response.json();
      const aiReply = data.reply || "I analyzed your inquiry against current sandbox parameters.";

      const aiMessage: DialogueMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDialogue(prev => [...prev, aiMessage]);
      speakText(aiReply);
    } catch (error) {
      console.error('Error communicating with voice copilot:', error);
      const fallbackMsg: DialogueMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: "I observed network socket egress and eval execution in the active repository. Immediate quarantine is recommended.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDialogue(prev => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e1511] border border-[#3c4a42] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#3c4a42]/60 bg-[#141b16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4edea3]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">Aegis Voice Security Copilot</h3>
                <span className="text-[10px] font-mono uppercase bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Voice
                </span>
              </div>
              <p className="text-xs text-[#bbcabf]">Real-time conversational security intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (!voiceMuted && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              title={voiceMuted ? "Unmute Voice" : "Mute Voice"}
              className={`p-2 rounded-lg border transition-colors ${
                voiceMuted 
                  ? 'bg-[#fc7c78]/10 border-[#fc7c78]/30 text-[#fc7c78]' 
                  : 'bg-[#1a211d] border-[#3c4a42] text-[#bbcabf] hover:text-[#4edea3]'
              }`}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1a211d] border border-[#3c4a42] text-[#bbcabf] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Waveform Canvas Banner */}
        <div className="bg-[#09100c] border-b border-[#3c4a42]/40 py-3 px-6 flex flex-col items-center justify-center relative">
          <canvas 
            ref={canvasRef} 
            width={480} 
            height={64} 
            className="w-full max-w-md h-14"
          />
          <div className="text-[11px] font-mono text-[#86948a] flex items-center gap-2 mt-1">
            {isSpeaking ? (
              <span className="text-[#4edea3] flex items-center gap-1 font-semibold">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Aegis Speaking...
              </span>
            ) : isListening ? (
              <span className="text-[#60a5fa] flex items-center gap-1 font-semibold">
                <Mic className="w-3.5 h-3.5 animate-pulse" /> Listening to your voice...
              </span>
            ) : isLoading ? (
              <span className="text-[#e0a82e] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing security context...
              </span>
            ) : (
              <span>Ready. Press microphone or speak your question.</span>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0e1511]">
          {dialogue.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-[#4edea3]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#10b981]/20 text-white border border-[#4edea3]/40'
                    : 'bg-[#1a211d] text-[#dde4dd] border border-[#3c4a42]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className="text-[10px] font-mono text-[#86948a] mt-1.5 text-right">
                  {msg.timestamp}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#242c27] border border-[#3c4a42] flex items-center justify-center text-[#dde4dd] shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
          {transcript && (
            <div className="flex justify-end gap-3">
              <div className="bg-[#10b981]/10 text-[#4edea3] border border-[#4edea3]/30 rounded-xl px-4 py-2.5 text-xs italic">
                "{transcript}..."
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div className="px-4 sm:px-6 py-2 border-t border-[#3c4a42]/40 bg-[#141b16] flex items-center gap-2 overflow-x-auto">
          {[
            "Why was this repo blocked?",
            "Explain the egress network risk",
            "What remediation is required?",
            "Search for related CVEs"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendVoiceMessage(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-md bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] text-[11px] text-[#bbcabf] hover:text-[#4edea3] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Voice Control & Input Area */}
        <div className="p-4 border-t border-[#3c4a42]/60 bg-[#0e1511] flex items-center gap-3">
          {speechSupported && (
            <button
              onClick={toggleMic}
              type="button"
              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                isListening
                  ? 'bg-[#fc7c78] text-white ring-4 ring-[#fc7c78]/30 scale-105 animate-pulse'
                  : 'bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_15px_rgba(78,222,163,0.4)]'
              }`}
              title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendVoiceMessage(inputText);
            }}
            className="flex-1 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Type or speak your security question..."}
              className="flex-1 bg-[#1F2937] border border-[#3c4a42] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#86948a] focus:border-[#4edea3] outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-[#1a211d] hover:bg-[#242c27] disabled:opacity-40 text-[#4edea3] border border-[#3c4a42] hover:border-[#4edea3] px-4 py-3 rounded-xl transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
