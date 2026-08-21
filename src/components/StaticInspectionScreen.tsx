import React, { useState } from 'react';
import { 
  Zap, 
  EyeOff, 
  AlertTriangle, 
  Package, 
  Bug, 
  Scale, 
  Code2, 
  ChevronRight,
  X,
  FileCode
} from 'lucide-react';
import { AnalysisSession, CodeFinding } from '../types';

interface StaticInspectionScreenProps {
  session: AnalysisSession;
}

export const StaticInspectionScreen: React.FC<StaticInspectionScreenProps> = ({ session }) => {
  const [selectedFinding, setSelectedFinding] = useState<CodeFinding | null>(null);

  const isHighRisk = session.trustScore < 50;
  const scoreColor = isHighRisk ? 'text-[#ffb4ab]' : 'text-[#4edea3]';
  const strokeColor = isHighRisk ? '#ffb4ab' : '#4edea3';

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Static Inspection</h2>
        <p className="text-sm text-[#bbcabf]">
          Detailed breakdown of static code analysis and associated risk vectors.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Code Findings */}
          <div className="surface-glass rounded-xl p-6 border border-white/10 relative overflow-hidden shadow-xl">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${isHighRisk ? 'bg-[#ffb4ab]' : 'bg-[#4edea3]'}`} />

            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
                  STATIC_ANALYSIS.CODE
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Code Findings</h3>
              </div>
              <span className="px-3 py-1 bg-[#93000a]/25 text-[#ffb4ab] text-xs font-semibold rounded-full flex items-center gap-1.5 border border-[#ffb4ab]/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{session.codeFindings.length > 1 ? 'Critical' : 'Low Risk'}</span>
              </span>
            </div>

            <ul className="space-y-3 mt-4">
              {session.codeFindings.map((finding) => (
                <li
                  key={finding.id}
                  onClick={() => setSelectedFinding(finding)}
                  className="flex items-center justify-between bg-[#1a211d] hover:bg-[#242c27] p-3.5 rounded-lg border border-[#3c4a42]/60 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    {finding.title.includes('Dynamic') ? (
                      <div className="w-9 h-9 rounded bg-[#ffb4ab]/10 flex items-center justify-center text-[#ffb4ab]">
                        <Zap className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded bg-[#ffb3af]/10 flex items-center justify-center text-[#ffb3af]">
                        <EyeOff className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-[#4edea3] transition-colors">
                        {finding.title}
                      </p>
                      <p className="font-mono text-xs text-[#86948a] mt-0.5">
                        {finding.location}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86948a] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </li>
              ))}
            </ul>
          </div>

          {/* Dependencies & License Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dependencies Card */}
            <div className="surface-glass rounded-xl p-6 border border-white/10 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
                    ENV.DEPENDENCIES
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Dependencies</h3>
                </div>
                <Package className="w-5 h-5 text-[#ffb3af]" />
              </div>

              <div className="mt-4 flex items-end gap-3">
                <div className="text-4xl font-extrabold text-white leading-none">
                  {session.dependenciesTotal}
                </div>
                <div className="text-xs text-[#86948a] mb-1 font-mono">Total Packages Indexed</div>
              </div>

              <div className={`mt-5 p-3 rounded-lg flex items-center gap-3 border ${
                session.dependenciesVulnerable > 0 
                  ? 'bg-[#93000a]/15 border-[#ffb4ab]/30' 
                  : 'bg-[#10b981]/15 border-[#4edea3]/30'
              }`}>
                {session.dependenciesVulnerable > 0 ? (
                  <>
                    <Bug className="w-4 h-4 text-[#ffb4ab] shrink-0" />
                    <span className="text-xs text-[#ffb4ab] font-medium font-mono">
                      {session.dependenciesVulnerable} Vulnerable Packages Found
                    </span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 text-[#4edea3] shrink-0" />
                    <span className="text-xs text-[#4edea3] font-medium font-mono">
                      0 Known CVEs Found
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* License Card */}
            <div className="surface-glass rounded-xl p-6 border border-white/10 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
                    LEGAL.COMPLIANCE
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">License</h3>
                </div>
                <Scale className="w-5 h-5 text-[#4edea3]" />
              </div>

              <div className="mt-4 flex items-center justify-center py-4 bg-[#1a211d] rounded-lg border border-[#3c4a42]/60">
                <span className="text-2xl font-black text-white font-mono tracking-wide">
                  {session.license}
                </span>
              </div>

              <p className="text-xs text-[#4edea3] mt-3.5 text-center font-medium font-mono">
                {session.licenseStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Score Breakdown */}
        <div className="lg:col-span-1">
          <div className="surface-glass rounded-xl p-6 border border-white/10 h-full flex flex-col shadow-xl">
            <div className="mb-4">
              <span className="font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
                METRIC.RISK_IMPACT
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Score Breakdown</h3>
            </div>

            {/* Main Score Display Gauge */}
            <div className="flex justify-center my-4 relative">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#242c27"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * session.trustScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold leading-none ${scoreColor}`}>
                  {session.trustScore}
                </span>
                <span className="font-mono text-xs text-[#86948a] mt-1">/ 100</span>
              </div>
            </div>

            {/* Waterfall List */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {session.scoreBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-[#3c4a42]/40 text-xs px-1 hover:bg-[#1a211d] rounded transition-colors"
                >
                  <span className="text-[#bbcabf] flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.color === 'error'
                          ? 'bg-[#ffb4ab]'
                          : item.color === 'tertiary'
                          ? 'bg-[#ffb3af]'
                          : 'bg-[#4edea3]'
                      }`}
                    />
                    {item.label}
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      item.points < 0
                        ? item.color === 'error'
                          ? 'text-[#ffb4ab]'
                          : 'text-[#ffb3af]'
                        : 'text-[#4edea3]'
                    }`}
                  >
                    {item.points > 0 ? `+${item.points}` : item.points === 0 ? '0' : item.points}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#3c4a42]/60 flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Final Score
              </span>
              <span className={`text-xl font-bold font-mono ${scoreColor}`}>
                {session.trustScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Finding Detail Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-glass rounded-2xl max-w-2xl w-full p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-start mb-4 border-b border-[#3c4a42]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-[#ffb4ab]" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedFinding.title}</h3>
                  <p className="font-mono text-xs text-[#86948a]">{selectedFinding.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-[#86948a] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#bbcabf] mb-4">{selectedFinding.description}</p>

            {selectedFinding.snippet && (
              <div className="mb-4">
                <div className="font-mono text-[11px] text-[#86948a] uppercase mb-1">Source Code Context:</div>
                <pre className="bg-[#09100c] text-[#dde4dd] font-mono text-xs p-4 rounded-lg border border-[#3c4a42] overflow-x-auto">
                  <code>{selectedFinding.snippet}</code>
                </pre>
              </div>
            )}

            {selectedFinding.remediation && (
              <div className="bg-[#10b981]/10 border border-[#4edea3]/30 p-3.5 rounded-lg mb-4">
                <div className="text-xs font-semibold text-[#4edea3] mb-1">Suggested Remediation:</div>
                <p className="text-xs text-[#bbcabf]">{selectedFinding.remediation}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedFinding(null)}
                className="px-4 py-2 rounded-lg bg-[#242c27] text-xs font-mono text-[#bbcabf] hover:text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
