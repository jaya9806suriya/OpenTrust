import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  GitFork, 
  BrainCircuit, 
  FileCode2, 
  Sparkles, 
  ShieldAlert, 
  Settings,
  Mic,
  Globe,
  Radio
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SideNavBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isPipelineRunning?: boolean;
  onOpenSettings: () => void;
  onOpenVoice?: () => void;
  onOpenThreatIntel?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentTab,
  onSelectTab,
  isPipelineRunning = false,
  onOpenSettings,
  onOpenVoice,
  onOpenThreatIntel
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'pipeline' as NavigationTab,
      label: 'Pipeline',
      icon: GitFork,
      badge: isPipelineRunning ? 'LIVE' : undefined
    },
    {
      id: 'behavior' as NavigationTab,
      label: 'Behavior',
      icon: BrainCircuit,
    },
    {
      id: 'static' as NavigationTab,
      label: 'Static Findings',
      icon: FileCode2,
    },
    {
      id: 'ai-analysis' as NavigationTab,
      label: 'AI Analysis',
      icon: Sparkles,
    },
    {
      id: 'trust-report' as NavigationTab,
      label: 'Trust Report',
      icon: ShieldAlert,
    },
  ];

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-[#0e1511] border-r border-[#3c4a42]/50 flex flex-col p-4 z-40 hidden md:flex">
      {/* Brand Header */}
      <div 
        onClick={() => onSelectTab('home')}
        className="mb-6 mt-2 px-3 flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-[#4edea3]/20 flex items-center justify-center border border-[#4edea3]/40 group-hover:border-[#4edea3] transition-colors">
          <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#4edea3] leading-tight tracking-tight flex items-center gap-1.5">
            OpenTrust
          </h1>
          <p className="text-[11px] font-mono text-[#86948a] uppercase tracking-wider">
            Cybersecurity Intelligence
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#10b981]/20 text-[#4edea3] font-semibold border border-[#4edea3]/30 shadow-[0_0_12px_rgba(78,222,163,0.15)]'
                  : 'text-[#bbcabf] hover:text-[#dde4dd] hover:bg-[#1a211d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4edea3]' : 'text-[#86948a]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Intelligence Actions Section */}
        <div className="pt-4 mt-4 border-t border-[#3c4a42]/30 space-y-2">
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#86948a]">
            Intelligence Engines
          </p>

          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/30 text-[#4edea3] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-[#4edea3] animate-pulse" />
                <span>Voice Copilot (Aegis)</span>
              </div>
              <Radio className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </button>
          )}

          {onOpenThreatIntel && (
            <button
              onClick={onOpenThreatIntel}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#1a211d] border border-transparent hover:border-[#3c4a42] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#86948a]" />
                <span>Google Search Intel</span>
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* System Settings at bottom */}
      <div className="pt-4 mt-auto border-t border-[#3c4a42]/40">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#3c4a42] text-xs font-mono text-[#bbcabf] hover:text-[#dde4dd] hover:bg-[#1a211d] hover:border-[#86948a] transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};
