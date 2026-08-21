import React, { useEffect, useState } from 'react';
import { 
  FolderArchive, 
  RotateCw, 
  CheckCircle2, 
  Download, 
  ShieldAlert, 
  Terminal, 
  Eye, 
  FileText, 
  ShieldCheck, 
  ListFilter, 
  Play, 
  Pause,
  FastForward, 
  AlertTriangle,
  ArrowRight,
  ShieldQuestion,
  Activity,
  Cpu,
  Lock,
  Sparkles
} from 'lucide-react';
import { AnalysisSession, PipelineStage } from '../types';

interface PipelineScreenProps {
  session: AnalysisSession;
  onAdvanceStage?: () => void;
  onCompleteSimulation?: () => void;
  onViewReport: () => void;
  onNavigateHome?: () => void;
}

export const PipelineScreen: React.FC<PipelineScreenProps> = ({
  session,
  onAdvanceStage,
  onCompleteSimulation,
  onViewReport,
  onNavigateHome
}) => {
  const [elapsed, setElapsed] = useState(session.elapsedSeconds || 1);
  const [isPaused, setIsPaused] = useState(false);

  // Live timer effect
  useEffect(() => {
    if (session.status === 'completed' || isPaused) return;
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session.status, isPaused]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageIcon = (index: number) => {
    switch (index) {
      case 0: return <Download className="w-5 h-5" />;
      case 1: return <ShieldCheck className="w-5 h-5" />;
      case 2: return <Terminal className="w-5 h-5" />;
      case 3: return <Eye className="w-5 h-5" />;
      case 4: return <FileText className="w-5 h-5" />;
      case 5: return <ShieldAlert className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const currentIdx = session.currentStageIndex ?? 0;
  const isFinished = session.status === 'completed' || currentIdx >= 5;
  const isFailed = session.status === 'failed';

  // Real-time stage descriptions & sub-details
  const stageDescriptions = [
    { title: 'INTAKE', subtitle: 'Cloning repository & validating tarball integrity', activeText: 'Extracting AST & dependency manifests...' },
    { title: 'INSPECT', subtitle: 'Static AST analysis & vulnerability feed correlation', activeText: 'Scanning syntax trees & CVE databases...' },
    { title: 'SANDBOX', subtitle: 'Controlled subprocess execution with scoped environment', activeText: 'Initializing scoped subprocess container...' },
    { title: 'OBSERVE', subtitle: 'Monitoring network egress, disk I/O, & process forks', activeText: 'Capturing socket egress & file descriptors...' },
    { title: 'EXPLAIN', subtitle: 'Forensic threat explanation & remediation synthesis', activeText: 'Generating behavioral security verdict...' },
    { title: 'TRUST SCORE', subtitle: 'Calculating Trust Score & policy compliance metrics', activeText: 'Finalizing security score and report...' }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* Error Banner if Pipeline Failed */}
      {isFailed && (
        <div className="bg-[#ba1a1a]/20 border border-[#ffb4ab]/50 rounded-xl p-5 text-[#ffb4ab] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-[#ffb4ab] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-white">Pipeline Execution Failed</h3>
              <p className="text-xs text-[#ffb4ab]/90 mt-1 font-mono break-all">
                {session.error || 'Failed to fetch or inspect target repository. Please verify the URL and network accessibility.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateHome ? onNavigateHome() : window.location.reload()}
            className="px-4 py-2 bg-[#ffb4ab] text-[#410002] rounded-lg font-bold text-xs hover:bg-white transition-colors shrink-0 cursor-pointer"
          >
            Try Another Repo
          </button>
        </div>
      )}

      {/* Metadata Bar */}
      <div className="surface-glass rounded-xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
              Target Repository
            </span>
            <div className="flex items-center gap-2 mt-1">
              <FolderArchive className="w-4 h-4 text-[#4edea3]" />
              <span className="font-semibold text-base text-[#dde4dd]">
                {session.targetRepo}
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-[#3c4a42]/50 hidden sm:block" />

          <div className="flex flex-col">
            <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
              Analysis ID
            </span>
            <span className="font-mono text-sm text-[#4edea3] mt-1 font-semibold">
              {session.id}
            </span>
          </div>

          <div className="w-px h-8 bg-[#3c4a42]/50 hidden md:block" />

          <div className="hidden md:flex flex-col">
            <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
              Engine Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isFailed ? 'bg-[#ffb4ab]' : isFinished ? 'bg-[#4edea3]' : 'bg-[#4edea3] animate-ping'}`} />
              <span className="font-mono text-xs text-[#dde4dd] font-medium">
                {isFailed ? 'Pipeline Failed' : isFinished ? 'Audit Completed' : `Running Stage ${currentIdx + 1} / 6`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <div className="flex flex-col text-right">
            <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
              Files Scanned
            </span>
            <span className="font-bold text-xl text-[#dde4dd]">
              {session.filesScanned || 0}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
              Elapsed Time
            </span>
            <span className="font-mono text-sm text-[#4edea3] mt-1 flex items-center gap-1.5 justify-end font-semibold">
              {!isFinished && !isFailed && <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />}
              {formatTimer(elapsed)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        {/* Left: Live Execution Pipeline */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="surface-glass rounded-xl p-6 md:p-8 flex-1 flex flex-col border border-white/10 shadow-xl relative">
            <div className="flex flex-wrap items-center justify-between border-b border-[#3c4a42]/40 pb-4 mb-6 gap-3">
              <h2 className="font-semibold text-lg text-white flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isFinished ? 'bg-[#4edea3]' : 'bg-[#4edea3] animate-pulse'}`} />
                Live Execution Pipeline
              </h2>

              {/* Simulation & Control Actions */}
              <div className="flex items-center gap-2">
                {!isFinished && (
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-3 py-1.5 rounded-lg bg-[#242c27] hover:bg-[#2f3632] border border-[#3c4a42] text-xs font-mono text-[#bbcabf] hover:text-white transition-colors flex items-center gap-1.5"
                    title={isPaused ? 'Resume live analysis' : 'Pause execution'}
                  >
                    {isPaused ? <Play className="w-3 h-3 text-[#4edea3]" /> : <Pause className="w-3 h-3 text-[#bbcabf]" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                )}

                {!isFinished && onAdvanceStage && (
                  <button
                    onClick={onAdvanceStage}
                    className="px-3 py-1.5 rounded-lg bg-[#242c27] hover:bg-[#2f3632] border border-[#3c4a42] text-xs font-mono text-[#bbcabf] hover:text-white transition-colors flex items-center gap-1.5"
                    title="Advance to next stage"
                  >
                    <Play className="w-3 h-3 text-[#4edea3]" />
                    <span>Next Stage</span>
                  </button>
                )}

                {!isFinished && onCompleteSimulation && (
                  <button
                    onClick={onCompleteSimulation}
                    className="px-3 py-1.5 rounded-lg bg-[#4edea3]/20 hover:bg-[#4edea3]/30 border border-[#4edea3]/40 text-xs font-mono text-[#4edea3] transition-colors flex items-center gap-1.5"
                    title="Finish all stages immediately"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>Finish Scan</span>
                  </button>
                )}

                {isFinished && (
                  <button
                    onClick={onViewReport}
                    className="px-4 py-2 rounded-lg bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(78,222,163,0.4)]"
                  >
                    <span>View Trust Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Pipeline Vertical Stages */}
            <div className="flex-1 flex flex-col justify-center relative px-4 md:px-12 py-4">
              {/* Connecting Line Background */}
              <div className="absolute left-8 md:left-16 top-10 bottom-10 w-1 bg-[#242c27] rounded-full z-0" />
              {/* Connecting Line Active */}
              <div 
                className="absolute left-8 md:left-16 top-10 w-1 bg-[#4edea3] rounded-full z-0 transition-all duration-700 shadow-[0_0_10px_rgba(78,222,163,0.5)]" 
                style={{ height: `${Math.min(100, ((currentIdx + (isFinished ? 1 : 0.5)) / 6) * 100)}%` }}
              />

              <div className="flex flex-col gap-7 z-10 relative">
                {stageDescriptions.map((st, idx) => {
                  const isStageCompleted = idx < currentIdx || isFinished;
                  const isStageActive = idx === currentIdx && !isFinished;
                  const isStagePending = idx > currentIdx && !isFinished;

                  return (
                    <div 
                      key={st.title} 
                      className={`flex items-center gap-6 group transition-all duration-300 ${
                        isStagePending ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      {/* Icon Circle */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 ${
                        isStageCompleted
                          ? 'bg-[#10b981]/20 text-[#4edea3] border-[#4edea3] shadow-[0_0_15px_rgba(78,222,163,0.25)]'
                          : isStageActive
                          ? 'bg-[#0e1511] text-[#4edea3] border-[#4edea3] ring-4 ring-[#4edea3]/20 shadow-[0_0_20px_rgba(78,222,163,0.4)] animate-pulse'
                          : 'bg-[#1a211d] text-[#86948a] border-[#3c4a42]'
                      }`}>
                        {getStageIcon(idx)}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs tracking-widest font-semibold ${
                            isStageCompleted || isStageActive ? 'text-[#4edea3]' : 'text-[#86948a]'
                          }`}>
                            STAGE 0{idx + 1}
                          </span>
                          {isStageActive && (
                            <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                              Active
                            </span>
                          )}
                          {isStageCompleted && (
                            <span className="px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] text-[10px] font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#4edea3]" /> Done
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-base md:text-lg text-white mt-0.5 flex items-center gap-2">
                          {st.title}
                        </div>

                        <div className="text-xs text-[#bbcabf] flex items-center gap-1.5 mt-0.5">
                          {isStageActive ? (
                            <span className="text-[#4edea3] font-medium flex items-center gap-1">
                              <RotateCw className="w-3 h-3 animate-spin" /> {st.activeText}
                            </span>
                          ) : isStageCompleted ? (
                            <span className="text-[#bbcabf]/90">{st.subtitle}</span>
                          ) : (
                            <span className="text-[#86948a]">Pending execution...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status & CTA Banner */}
            <div className="mt-6 pt-4 border-t border-[#3c4a42]/40 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[#86948a]">
                <Cpu className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>Isolated Sandbox Container:</span>
                <span className="font-mono text-[#4edea3] font-medium">docker://sec-iso-7749</span>
              </div>

              <button
                onClick={onViewReport}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#4edea3] hover:underline"
              >
                <span>{isFinished ? 'Open Complete Trust Report' : 'Preview Current Findings'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Event Feed & Kernel Stream */}
        <div className="w-full xl:w-[420px] flex flex-col gap-6">
          <div className="surface-glass rounded-xl p-0 flex-1 flex flex-col overflow-hidden border border-white/10 shadow-xl">
            <div className="p-4 border-b border-[#3c4a42]/40 flex justify-between items-center bg-[#0e1511]/80">
              <h3 className="font-semibold text-sm text-[#dde4dd] flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-[#4edea3]" />
                Event Stream & Execution Logs
              </h3>
              <span className="font-mono text-[11px] font-semibold text-[#4edea3] bg-[#10b981]/15 px-2.5 py-0.5 rounded border border-[#4edea3]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping" />
                {isFinished ? 'CAPTURED' : 'LIVE'}
              </span>
            </div>

            {/* Log Console Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 font-mono text-xs bg-[#09100c] min-h-[460px] max-h-[560px]">
              {/* Event 1 */}
              <div className="flex gap-3 text-[#bbcabf]/70">
                <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:01</span>
                <div className="flex gap-2 break-all">
                  <span className="text-[#4edea3]">✓</span>
                  <span>Analysis session {session.id} initialized</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex gap-3 text-[#bbcabf]/70">
                <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:02</span>
                <div className="flex gap-2 break-all">
                  <span className="text-[#4edea3]">✓</span>
                  <span>Target repository <strong>{session.targetRepo}</strong> cloned</span>
                </div>
              </div>

              {/* Event 3 */}
              {currentIdx >= 1 && (
                <div className="flex gap-3 text-[#bbcabf]/80 animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:04</span>
                  <div className="flex gap-2 break-all">
                    <span className="text-[#4edea3]">✓</span>
                    <span>AST parsing completed ({session.filesScanned || 124} files indexed)</span>
                  </div>
                </div>
              )}

              {/* Event 4 */}
              {currentIdx >= 1 && (
                <div className="flex gap-3 text-[#bbcabf]/90 animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:07</span>
                  <div className="flex gap-2 break-all">
                    <span className="text-[#4edea3]">✓</span>
                    <span>Dependency manifest parsed & cross-referenced with CVE catalog</span>
                  </div>
                </div>
              )}

              {/* Event 5: Sandbox stage */}
              {currentIdx >= 2 && (
                <div className="flex gap-3 text-[#bbcabf] animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:10</span>
                  <div className="flex gap-2 break-all">
                    <span className="text-[#4edea3]">✓</span>
                    <span>Controlled subprocess environment spawned (scoped variables & hard timeout)</span>
                  </div>
                </div>
              )}

              {/* Event 6: Warning flag */}
              {currentIdx >= 2 && session.verdict === 'BLOCK' && (
                <div className="flex gap-3 text-[#ffb4ab] animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:14</span>
                  <div className="flex gap-2 break-all bg-[#93000a]/20 p-2 rounded border border-[#ffb4ab]/30 w-full">
                    <AlertTriangle className="w-4 h-4 text-[#ffb4ab] shrink-0 mt-0.5" />
                    <span>Suspicious execution pattern flagged in AST analysis</span>
                  </div>
                </div>
              )}

              {/* Event 7: Observe */}
              {currentIdx >= 3 && (
                <div className="flex gap-3 text-[#bbcabf] animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:18</span>
                  <div className="flex gap-2 break-all">
                    <span className="text-[#4edea3]">✓</span>
                    <span>Subprocess I/O telemetry & descriptor access monitored</span>
                  </div>
                </div>
              )}

              {/* Event 8: Explain with Gemini */}
              {currentIdx >= 4 && (
                <div className="flex gap-3 text-[#a8c7fa] animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:22</span>
                  <div className="flex gap-2 break-all bg-[#0b57d0]/15 p-2 rounded border border-[#a8c7fa]/30 w-full">
                    <Sparkles className="w-4 h-4 text-[#a8c7fa] shrink-0 mt-0.5" />
                    <span>Gemini AI security synthesis & remediation compiled</span>
                  </div>
                </div>
              )}

              {/* Event 9: Final Trust score */}
              {currentIdx >= 5 && (
                <div className="flex gap-3 animate-fadeIn">
                  <span className="text-[11px] text-[#86948a] shrink-0 pt-0.5">00:25</span>
                  <div className={`flex gap-2 break-all p-2 rounded border w-full ${
                    session.verdict === 'TRUST' 
                      ? 'text-[#4edea3] bg-[#10b981]/20 border-[#4edea3]/40'
                      : 'text-[#fc7c78] bg-[#ba1a1a]/20 border-[#ffb4ab]/40'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Trust Score finalized: <strong>{session.trustScore}/100</strong> (Verdict: {session.verdict})</span>
                  </div>
                </div>
              )}

              {/* Dynamic typing indicator if running */}
              {!isFinished && (
                <div className="flex gap-3 text-[#86948a] mt-2">
                  <span className="text-[11px] shrink-0 pt-0.5 font-mono">{formatTimer(elapsed)}</span>
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

              {/* Completed action card */}
              {isFinished && (
                <div className="mt-4 p-3.5 rounded-lg bg-[#1a211d] border border-[#4edea3]/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Analysis Complete</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      session.verdict === 'TRUST' ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                    }`}>
                      {session.verdict} ({session.trustScore}/100)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#bbcabf] leading-relaxed">
                    Full behavioral report, static findings, and remediation patches are available.
                  </p>
                  <button
                    onClick={onViewReport}
                    className="w-full py-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 mt-1"
                  >
                    <span>Inspect Security Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
