import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Sparkles, 
  FolderX, 
  Router, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  FileDown, 
  Copy, 
  Lock, 
  AlertOctagon,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AnalysisSession } from '../types';

interface TrustReportScreenProps {
  session: AnalysisSession;
  onAnalyzeAnother: () => void;
  onNavigateToStatic: () => void;
  onNavigateToBehavior: () => void;
}

export const TrustReportScreen: React.FC<TrustReportScreenProps> = ({
  session,
  onAnalyzeAnother,
  onNavigateToStatic,
  onNavigateToBehavior
}) => {
  const [quarantined, setQuarantined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const isBlocked = session.trustScore < 50;
  const isReview = session.trustScore >= 50 && session.trustScore < 80;
  const isTrusted = session.trustScore >= 80;

  const scoreStrokeColor = isBlocked ? '#ffb4ab' : isReview ? '#fc7c78' : '#4edea3';
  const scoreTextColor = isBlocked ? 'text-[#ffb4ab]' : isReview ? 'text-[#fc7c78]' : 'text-[#4edea3]';
  const borderColor = isBlocked ? 'border-l-[#ffb4ab]' : isReview ? 'border-l-[#fc7c78]' : 'border-l-[#4edea3]';
  const glowClass = isBlocked ? 'glow-error' : 'glow-primary';

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `opentrust-report-${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(`OpenTrust Security Verdict for ${session.targetRepo}: ${session.verdict} (Score: ${session.trustScore}/100)\n\n${session.executiveSummary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-7xl mx-auto w-full pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Trust Report</h2>
          <div className="flex items-center gap-2.5 text-xs text-[#bbcabf]">
            <span className="font-mono text-[#dde4dd] bg-[#242c27] px-2.5 py-1 rounded border border-white/5">
              ID: {session.id === 'ANL-7749-X' ? 'TR-8924-XX' : session.id}
            </span>
            <span>•</span>
            <span>Generated: {session.generatedAt || '2 mins ago'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#3c4a42] text-[#dde4dd] hover:bg-[#1a211d] hover:border-[#86948a] transition-colors text-xs md:text-sm font-medium"
          >
            <Download className="w-4 h-4 text-[#86948a]" />
            <span>Export Trust Report</span>
          </button>
          <button
            onClick={onAnalyzeAnother}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#242c27] text-white border border-[#3c4a42] hover:bg-[#2f3632] transition-colors text-xs md:text-sm font-medium"
          >
            <Search className="w-4 h-4 text-[#4edea3]" />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Top Summary Banner */}
        <div className={`xl:col-span-12 surface-glass rounded-xl p-6 md:p-8 ${glowClass} flex flex-col md:flex-row items-center gap-8 border-l-4 ${borderColor} border border-white/10 shadow-2xl relative overflow-hidden`}>
          {/* Score Circle Gauge */}
          <div className="w-48 h-48 relative shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-[#242c27]"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={scoreStrokeColor}
                strokeWidth="3"
                strokeDasharray={`${session.trustScore}, 100`}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-5xl font-extrabold leading-none ${scoreTextColor}`}>
                {session.trustScore}
              </span>
              <span className="text-xs font-mono text-[#86948a] mt-1.5 font-medium">/ 100</span>
            </div>
          </div>

          {/* Verdict & Subtext */}
          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#93000a]/20 border border-[#ffb4ab]/30">
              <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-[#ffb4ab] animate-pulse' : 'bg-[#4edea3]'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isBlocked ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}`}>
                {isBlocked ? 'Critical Alert' : 'Verified Secure'}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {isBlocked
                ? '🔴 BLOCK - High-risk behavior detected'
                : isReview
                ? '🟡 REVIEW - Elevated risk factors'
                : '🟢 TRUST - Benign repository verified'}
            </h3>

            <p className="text-sm md:text-base text-[#bbcabf] max-w-3xl leading-relaxed">
              {session.trustScore < 50
                ? 'The repository showed suspicious runtime behavior involving sensitive file access, process execution, and external network activity. Immediate remediation is required before integration into the primary pipeline.'
                : 'The repository demonstrated verified safe runtime behavior, zero unauthorized socket egress, and cleanly isolated dependencies adhering to enterprise security baselines.'}
            </p>
          </div>
        </div>

        {/* AI Security Analysis Card */}
        <div className="xl:col-span-12 surface-glass rounded-xl p-6 md:p-8 flex flex-col border border-white/10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#3c4a42]/50">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#4edea3]" />
              <h3 className="text-xl font-bold text-white tracking-tight">AI Security Analysis</h3>
            </div>
            <span className="font-mono text-xs text-[#86948a] bg-[#1a211d] px-3 py-1 rounded border border-[#3c4a42]">
              ENGINE: GPT-4-SEC / GEMINI-2.5
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Executive Summary */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-[13px]">
                Executive Summary
              </h4>
              <p className="text-sm text-[#bbcabf] leading-relaxed">
                {session.executiveSummary}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleCopySummary}
                  className="text-xs font-mono text-[#4edea3] hover:underline flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to clipboard' : 'Copy executive summary'}</span>
                </button>
              </div>
            </div>

            {/* Key Risk Flags */}
            <div className="lg:col-span-1 space-y-3.5">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-[13px]">
                Key Risk Flags
              </h4>
              <div className="flex flex-col gap-2.5">
                {session.riskFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                      flag.type === 'error'
                        ? 'bg-[#93000a]/15 border-[#ffb4ab]/25 hover:border-[#ffb4ab]/40'
                        : 'bg-[#10b981]/10 border-[#4edea3]/25 hover:border-[#4edea3]/40'
                    }`}
                  >
                    {flag.icon === 'folder_off' ? (
                      <FolderX className="w-5 h-5 text-[#ffb4ab] shrink-0 mt-0.5" />
                    ) : flag.icon === 'router' ? (
                      <Router className="w-5 h-5 text-[#ffb4ab] shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold ${flag.type === 'error' ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}`}>
                        {flag.title}
                      </p>
                      <p className="text-xs text-[#bbcabf] mt-1 font-mono">
                        {flag.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="lg:col-span-1 space-y-4 bg-[#1a211d]/70 p-5 rounded-xl border border-[#3c4a42]/60 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider font-mono text-[13px]">
                  Recommended Action
                </h4>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  {session.recommendedAction}
                </p>
              </div>

              {isBlocked ? (
                <button
                  onClick={() => setQuarantined(!quarantined)}
                  className={`w-full font-bold text-xs md:text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    quarantined
                      ? 'bg-[#242c27] text-[#4edea3] border border-[#4edea3]'
                      : 'bg-[#ffb4ab] text-[#690005] hover:bg-[#ffdad6] shadow-[0_0_15px_rgba(255,180,171,0.25)]'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{quarantined ? 'Quarantine Active (Enforced)' : 'Enforce Quarantine'}</span>
                </button>
              ) : (
                <button
                  className="w-full bg-[#4edea3] text-[#002113] font-bold text-xs md:text-sm py-3 rounded-lg hover:bg-[#6ffbbe] transition-all shadow-[0_0_15px_rgba(78,222,163,0.25)] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve for CI/CD Release</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-glass rounded-2xl max-w-lg w-full p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#3c4a42]/60 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-[#4edea3]" />
                Export OpenTrust Forensic Report
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#86948a] hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#bbcabf] mb-4 leading-relaxed">
              Export this verified cryptographic scan verdict for compliance auditing (SOC2, ISO 27001, SLSA Level 3).
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => { handleExport(); setShowExportModal(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <FileDown className="w-5 h-5 text-[#4edea3]" />
                  <div>
                    <div className="text-sm font-semibold text-white">Full JSON Artifact</div>
                    <div className="text-xs text-[#86948a]">Machine-readable telemetry & syscall log</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#4edea3]">.JSON</span>
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg bg-[#242c27] text-xs font-mono text-[#bbcabf] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
