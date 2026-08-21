import React, { useState, useEffect } from 'react';
import { Search, X, FolderGit2, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { sampleRepositories } from '../data/mockData';
import { NavigationTab } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repoUrl: string, demoMode: 'safe' | 'suspicious') => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRepo,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = sampleRepositories.filter(
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.url.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="surface-glass rounded-2xl max-w-xl w-full p-4 md:p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[#3c4a42]/60 pb-3 mb-4">
          <Search className="w-5 h-5 text-[#4edea3]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories, analysis IDs (e.g., ANL-7749-X), or jump to tabs..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#86948a] outline-none font-mono"
          />
          <button onClick={onClose} className="text-[#86948a] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-mono uppercase text-[#86948a] mb-2">Repositories & Reports</div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {filtered.map((repo, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectRepo(repo.url, repo.status === 'BLOCK' ? 'suspicious' : 'safe');
                    onClose();
                  }}
                  className="p-3 rounded-lg bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42]/50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {repo.status === 'BLOCK' ? (
                      <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-white">{repo.name}</div>
                      <div className="text-[11px] font-mono text-[#86948a]">{repo.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#4edea3] font-bold">{repo.score}/100</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#86948a]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-[#86948a] mb-2">Quick Navigation</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <button
                onClick={() => { onNavigateTab('pipeline'); onClose(); }}
                className="p-2 rounded bg-[#1a211d] hover:bg-[#242c27] text-left text-[#bbcabf] hover:text-[#4edea3] transition-colors"
              >
                ➔ Pipeline
              </button>
              <button
                onClick={() => { onNavigateTab('behavior'); onClose(); }}
                className="p-2 rounded bg-[#1a211d] hover:bg-[#242c27] text-left text-[#bbcabf] hover:text-[#4edea3] transition-colors"
              >
                ➔ Behavior Timeline
              </button>
              <button
                onClick={() => { onNavigateTab('static'); onClose(); }}
                className="p-2 rounded bg-[#1a211d] hover:bg-[#242c27] text-left text-[#bbcabf] hover:text-[#4edea3] transition-colors"
              >
                ➔ Static Findings
              </button>
              <button
                onClick={() => { onNavigateTab('ai-analysis'); onClose(); }}
                className="p-2 rounded bg-[#1a211d] hover:bg-[#242c27] text-left text-[#bbcabf] hover:text-[#4edea3] transition-colors"
              >
                ➔ AI Analysis
              </button>
              <button
                onClick={() => { onNavigateTab('trust-report'); onClose(); }}
                className="p-2 rounded bg-[#1a211d] hover:bg-[#242c27] text-left text-[#bbcabf] hover:text-[#4edea3] transition-colors"
              >
                ➔ Trust Report
              </button>
              <button
                onClick={() => { onNavigateTab('compliance'); onClose(); }}
                className="p-2 rounded bg-[#1a211d] hover:bg-[#242c27] text-left text-[#bbcabf] hover:text-[#4edea3] transition-colors"
              >
                ➔ Compliance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
