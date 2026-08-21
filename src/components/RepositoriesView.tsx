import React from 'react';
import { 
  FolderGit2, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { sampleRepositories } from '../data/mockData';

interface RepositoriesViewProps {
  onSelectRepo: (repoUrl: string, demoMode: 'safe' | 'suspicious') => void;
  onAnalyzeNew: () => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({
  onSelectRepo,
  onAnalyzeNew
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Repository Inventory</h2>
          <p className="text-sm text-[#bbcabf]">
            Inspected artifacts, active quarantines, and verified release baselines.
          </p>
        </div>

        <button
          onClick={onAnalyzeNew}
          className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] font-semibold text-xs md:text-sm px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Analyze New Repository</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs font-mono text-[#86948a] uppercase">Total Analyzed</div>
          <div className="text-2xl font-bold text-white mt-1">1,429</div>
          <div className="text-[11px] text-[#4edea3] mt-1 flex items-center gap-1">
            <span>+14 this week</span>
          </div>
        </div>
        <div className="surface-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs font-mono text-[#86948a] uppercase">Quarantined (Blocked)</div>
          <div className="text-2xl font-bold text-[#ffb4ab] mt-1">38</div>
          <div className="text-[11px] text-[#ffb4ab] mt-1">2.6% threat rate</div>
        </div>
        <div className="surface-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs font-mono text-[#86948a] uppercase">Passed (Trusted)</div>
          <div className="text-2xl font-bold text-[#4edea3] mt-1">1,315</div>
          <div className="text-[11px] text-[#4edea3] mt-1">92% auto-approved</div>
        </div>
        <div className="surface-glass p-4 rounded-xl border border-white/10">
          <div className="text-xs font-mono text-[#86948a] uppercase">Manual Review</div>
          <div className="text-2xl font-bold text-[#fc7c78] mt-1">76</div>
          <div className="text-[11px] text-[#86948a] mt-1">Pending approval</div>
        </div>
      </div>

      <div className="surface-glass rounded-xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#3c4a42]/50 flex justify-between items-center bg-[#0e1511]/50">
          <h3 className="font-semibold text-sm text-white">Recent Repository Scans</h3>
          <span className="text-xs font-mono text-[#86948a]">Showing {sampleRepositories.length} items</span>
        </div>

        <div className="divide-y divide-[#3c4a42]/40">
          {sampleRepositories.map((repo, idx) => {
            const isBlocked = repo.status === 'BLOCK';
            const isTrust = repo.status === 'TRUST';
            return (
              <div
                key={idx}
                onClick={() => onSelectRepo(repo.url, isBlocked ? 'suspicious' : 'safe')}
                className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#242c27]/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
                    isBlocked 
                      ? 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]' 
                      : 'bg-[#10b981]/20 border-[#4edea3]/30 text-[#4edea3]'
                  }`}>
                    {isBlocked ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      <span>{repo.name}</span>
                      <span className="font-mono text-xs text-[#86948a] font-normal hidden md:inline">
                        ({repo.type})
                      </span>
                    </div>
                    <div className="font-mono text-xs text-[#86948a] mt-0.5">
                      {repo.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-mono text-[#86948a]">Trust Score</span>
                    <span className={`font-mono text-base font-bold ${
                      isBlocked ? 'text-[#ffb4ab]' : isTrust ? 'text-[#4edea3]' : 'text-[#fc7c78]'
                    }`}>
                      {repo.score}/100
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase ${
                    isBlocked 
                      ? 'bg-[#93000a]/25 text-[#ffb4ab] border border-[#ffb4ab]/30'
                      : isTrust
                      ? 'bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30'
                      : 'bg-[#fc7c78]/20 text-[#fc7c78] border border-[#fc7c78]/30'
                  }`}>
                    {repo.status}
                  </span>

                  <span className="text-xs text-[#86948a] font-mono hidden md:inline">
                    {repo.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
