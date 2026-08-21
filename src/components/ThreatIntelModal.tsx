import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  X, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Loader2,
  BookOpen,
  ArrowRight,
  Fingerprint
} from 'lucide-react';

interface ThreatIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export const ThreatIntelModal: React.FC<ThreatIntelModalProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [intelResult, setIntelResult] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [webQueries, setWebQueries] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presetQueries = [
    { label: "XZ Utils Backdoor (CVE-2024-3094)", query: "CVE-2024-3094 XZ Utils liblzma upstream backdoor supply chain attack" },
    { label: "Log4Shell (CVE-2021-44228)", query: "CVE-2021-44228 Log4j remote code execution JNDI lookup vulnerability" },
    { label: "event-stream (flatmap-stream)", query: "event-stream npm package flatmap-stream Bitcoin wallet stealer attack" },
    { label: "Colors.js / Faker.js Malicious Loop", query: "colors.js faker.js Marak npm denial of service sabotage" },
    { label: "PyPI CTX & PHPass Supply Chain", query: "PyPI ctx phpass package takeover credential harvester" }
  ];

  const handleSearch = async (queryText?: string) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setIntelResult(null);
    setGroundingSources([]);

    try {
      const response = await fetch('/api/gemini/search-threat-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      const data = await response.json();
      if (data.success) {
        setIntelResult(data.intel);
        setGroundingSources(data.grounding?.sources || []);
        setWebQueries(data.grounding?.webSearchQueries || []);
      } else {
        setErrorMsg(data.error || 'Failed to retrieve grounded threat intelligence.');
      }
    } catch (err: any) {
      console.error('Error querying threat intel:', err);
      setErrorMsg(err.message || 'Network error querying threat intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e1511] border border-[#3c4a42] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3c4a42]/60 bg-[#141b16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">Live Threat Intel & CVE Grounding</h3>
                <span className="text-[10px] font-mono uppercase bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-[#bbcabf]">
                Real-time CVE advisories, malware signatures, supply chain attacks, and IoCs verified against live web data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1a211d] border border-[#3c4a42] text-[#bbcabf] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-[#3c4a42]/40 bg-[#0e1511]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86948a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter CVE ID (e.g. CVE-2024-3094), package name (e.g. event-stream), or threat vector..."
                className="w-full bg-[#1F2937] border border-[#3c4a42] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#86948a] focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="bg-[#4edea3] hover:bg-[#6ffbbe] disabled:opacity-50 text-[#002113] font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all text-sm shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Query Google Grounding</span>
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[#86948a] font-mono text-[11px] whitespace-nowrap">Suggested:</span>
            {presetQueries.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(item.query);
                  handleSearch(item.query);
                }}
                className="whitespace-nowrap bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] hover:border-[#4edea3]/50 text-[#bbcabf] hover:text-[#4edea3] px-2.5 py-1 rounded-md transition-colors text-xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0e1511]">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#4edea3] border-t-transparent animate-spin flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#4edea3]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Searching Live Threat Intelligence via Google...</p>
                <p className="text-xs text-[#86948a] mt-1 font-mono">Querying NVD, MITRE CVE, GitHub Advisories & Threat Feeds</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#fc7c78]/10 border border-[#fc7c78]/30 flex items-start gap-3 text-[#fc7c78]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Search Request Error</h4>
                <p className="text-xs mt-1 text-[#fc7c78]/90">{errorMsg}</p>
              </div>
            </div>
          )}

          {intelResult && !isLoading && (
            <div className="space-y-6">
              {/* Web Grounding Sources Box */}
              {groundingSources.length > 0 && (
                <div className="bg-[#141b16] border border-[#3c4a42] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#4edea3] mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span>Verified Web Grounding Sources ({groundingSources.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingSources.map((source, idx) => source.web && (
                      <a
                        key={idx}
                        href={source.web.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1511] border border-[#3c4a42]/60 hover:border-[#4edea3]/50 text-xs text-[#dde4dd] hover:text-[#4edea3] transition-colors group"
                      >
                        <span className="truncate pr-2">{source.web.title || source.web.uri}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#86948a] group-hover:text-[#4edea3] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Threat Intel Body */}
              <div className="bg-[#1a211d] border border-[#3c4a42] rounded-xl p-6 text-sm text-[#dde4dd] leading-relaxed whitespace-pre-line font-sans shadow-lg">
                {intelResult}
              </div>
            </div>
          )}

          {!intelResult && !isLoading && !errorMsg && (
            <div className="py-12 text-center flex flex-col items-center justify-center text-[#86948a]">
              <Fingerprint className="w-12 h-12 text-[#3c4a42] mb-3" />
              <p className="text-sm font-medium text-[#bbcabf]">Real-Time Security Intelligence Engine</p>
              <p className="text-xs text-[#86948a] max-w-md mt-1">
                Lookup any dependency, CVE ID, or library to verify supply-chain risks against live Google Search databases before running code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
