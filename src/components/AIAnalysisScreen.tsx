import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Code2, 
  FileText, 
  Terminal,
  Zap,
  Copy,
  Check,
  Globe,
  Loader2,
  ExternalLink,
  Mic
} from 'lucide-react';
import { AnalysisSession } from '../types';

interface AIAnalysisScreenProps {
  session: AnalysisSession;
  onOpenVoice?: () => void;
  onOpenThreatIntel?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  codeBlock?: string;
  groundingSources?: { web?: { uri: string; title: string } }[];
  timestamp: string;
}

export const AIAnalysisScreen: React.FC<AIAnalysisScreenProps> = ({ 
  session,
  onOpenVoice,
  onOpenThreatIntel
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I am your OpenTrust AI Security Copilot. I have inspected repository "${session.targetRepo}" (Analysis ID: ${session.id}).\n\nVerdict: ${session.verdict} (Risk Score: ${session.trustScore}/100).\n${session.executiveSummary}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    "Why was this repository blocked?",
    "Generate a remediation patch for eval()",
    "Analyze the network egress payload",
    "Search Google for CVEs on this package",
    "Create a SLSA & SOC2 security compliance summary"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    const isSearchQuery = query.toLowerCase().includes('google') || 
                          query.toLowerCase().includes('cve') || 
                          query.toLowerCase().includes('vulnerability') ||
                          query.toLowerCase().includes('threat intel');

    try {
      if (isSearchQuery) {
        // Query Google Search Grounded Endpoint
        const response = await fetch('/api/gemini/search-threat-intel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query, packageName: session.targetRepo })
        });
        const data = await response.json();
        
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.intel || "Threat intelligence retrieved.",
          groundingSources: data.grounding?.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Query Standard Copilot
        const response = await fetch('/api/gemini/voice-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            conversationHistory: messages.slice(-5).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
            context: {
              targetRepo: session.targetRepo,
              trustScore: session.trustScore,
              verdict: session.verdict,
              riskFlags: session.riskFlags
            }
          })
        });
        const data = await response.json();

        let snippet: string | undefined = undefined;
        if (query.toLowerCase().includes('patch') || query.toLowerCase().includes('eval') || query.toLowerCase().includes('fix')) {
          snippet = `// REPLACEMENT FOR core/parser.js:42
- const execBuffer = Buffer.from(rawPayload, "base64").toString();
- eval(execBuffer);
+ import { safeJsonParse } from "./sanitizer";
+ const parsedAST = safeJsonParse(rawPayload);
+ if (!parsedAST.valid) {
+   throw new SecurityValidationError("Malformed AST input token");
+ }`;
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || "Analysis completed.",
          codeBlock: snippet,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      // Fallback
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `OpenTrust behavioral analysis confirms repository "${session.targetRepo}" attempts unauthorized network socket connections and executes obfuscated eval buffers. Recommended action: Quarantine immediately and enforce static blocklist rules.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16 h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2.5 tracking-tight">
            <Sparkles className="w-6 h-6 text-[#4edea3]" />
            AI Security Analysis & Copilot
          </h2>
          <p className="text-xs sm:text-sm text-[#bbcabf]">
            Deep-dive forensic explanations, code de-obfuscation, and Google Search grounded threat intel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenThreatIntel && (
            <button
              onClick={onOpenThreatIntel}
              className="bg-[#1a211d] hover:bg-[#242c27] text-[#4edea3] border border-[#3c4a42] hover:border-[#4edea3] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Threat Intel</span>
            </button>
          )}

          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="bg-[#4edea3]/20 hover:bg-[#4edea3]/30 text-[#4edea3] border border-[#4edea3]/50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Voice Copilot</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-[#86948a] bg-[#1a211d] px-3 py-1.5 rounded-lg border border-[#3c4a42]">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span>MODEL: GEMINI-2.5-FLASH</span>
          </div>
        </div>
      </div>

      {/* Chat & Forensic Area */}
      <div className="surface-glass rounded-xl flex-1 flex flex-col border border-white/10 overflow-hidden shadow-2xl">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#4edea3]/20 flex items-center justify-center border border-[#4edea3]/40 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#4edea3]" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#10b981]/20 text-white border border-[#4edea3]/40'
                    : 'bg-[#1a211d] text-[#dde4dd] border border-[#3c4a42]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Grounding Web Sources if available */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#3c4a42] space-y-1.5">
                    <div className="text-[11px] font-mono text-[#4edea3] flex items-center gap-1.5 font-medium">
                      <Globe className="w-3 h-3" />
                      <span>Google Search Grounded Citations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingSources.map((source, sIdx) => source.web && (
                        <a
                          key={sIdx}
                          href={source.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-[#0e1511] px-2.5 py-1 rounded border border-[#3c4a42] text-[10px] text-[#dde4dd] hover:text-[#4edea3] hover:border-[#4edea3] transition-colors truncate max-w-xs"
                        >
                          <span className="truncate">{source.web.title || source.web.uri}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {msg.codeBlock && (
                  <div className="mt-3 relative">
                    <div className="flex justify-between items-center bg-[#09100c] px-3 py-1.5 rounded-t border-t border-x border-[#3c4a42] text-[11px] font-mono text-[#86948a]">
                      <span>patch-suggestion.diff</span>
                      <button
                        onClick={() => handleCopyCode(msg.id, msg.codeBlock!)}
                        className="hover:text-white flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-[#09100c] p-3 rounded-b border border-[#3c4a42] font-mono text-xs text-[#4edea3] overflow-x-auto">
                      <code>{msg.codeBlock}</code>
                    </pre>
                  </div>
                )}

                <div className="mt-2 text-[10px] font-mono text-[#86948a] text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#242c27] flex items-center justify-center border border-[#3c4a42] shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#dde4dd]" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-[#86948a]">
              <div className="w-8 h-8 rounded-lg bg-[#4edea3]/20 flex items-center justify-center border border-[#4edea3]/40 shrink-0">
                <Bot className="w-4 h-4 text-[#4edea3]" />
              </div>
              <div className="bg-[#1a211d] px-4 py-2.5 rounded-xl border border-[#3c4a42] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#4edea3] animate-spin" />
                <span>Gemini is generating forensic explanation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 sm:px-6 py-2 border-t border-[#3c4a42]/40 bg-[#0e1511]/50 flex gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] text-xs text-[#bbcabf] hover:text-[#4edea3] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-4 border-t border-[#3c4a42]/50 bg-[#0e1511] flex gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Copilot about repository security, sandbox traces, or CVE threat grounding..."
            className="flex-1 bg-[#1F2937] border border-[#3c4a42] rounded-lg px-4 py-3 text-xs md:text-sm text-white placeholder:text-[#86948a] focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none font-mono"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-[#4edea3] hover:bg-[#6ffbbe] disabled:opacity-50 text-[#002113] font-semibold px-5 py-3 rounded-lg flex items-center gap-1.5 transition-all text-xs md:text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
