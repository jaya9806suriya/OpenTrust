import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Plus, 
  FolderGit2, 
  FileCheck, 
  Server, 
  Home,
  Mic,
  Globe,
  User as UserIcon,
  LogIn,
  Database,
  Download
} from 'lucide-react';
import { User } from 'firebase/auth';
import { NavigationTab } from '../types';

interface TopAppBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onAnalyzeNew: () => void;
  unreadAlertsCount?: number;
  onOpenSearch?: () => void;
  onOpenVoice?: () => void;
  onOpenThreatIntel?: () => void;
  onOpenAuth?: () => void;
  user?: User | null;
  targetRepoName?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onSelectTab,
  onAnalyzeNew,
  unreadAlertsCount = 2,
  onOpenSearch,
  onOpenVoice,
  onOpenThreatIntel,
  onOpenAuth,
  user,
  targetRepoName
}) => {
  return (
    <header className="bg-[#0e1511]/90 backdrop-blur-xl border-b border-[#3c4a42]/50 sticky top-0 z-40 h-16 w-full px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left branding / navigation */}
      <div className="flex items-center gap-6">
        {/* Mobile branding */}
        <button 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 md:hidden text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded bg-[#4edea3]/20 flex items-center justify-center border border-[#4edea3]/40">
            <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
          </div>
          <span className="font-bold text-lg text-[#4edea3]">OpenTrust</span>
        </button>

        {/* Global Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors py-1 ${
              currentTab === 'home'
                ? 'text-[#4edea3] border-b-2 border-[#4edea3]'
                : 'text-[#bbcabf] hover:text-[#dde4dd]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('overview')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors py-1 ${
              currentTab === 'overview'
                ? 'text-[#4edea3] border-b-2 border-[#4edea3]'
                : 'text-[#bbcabf] hover:text-[#dde4dd]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Repositories</span>
          </button>

          <button
            onClick={() => onSelectTab('compliance')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors py-1 ${
              currentTab === 'compliance'
                ? 'text-[#4edea3] border-b-2 border-[#4edea3]'
                : 'text-[#bbcabf] hover:text-[#dde4dd]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Compliance</span>
          </button>

          <button
            onClick={() => onSelectTab('infrastructure')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors py-1 ${
              currentTab === 'infrastructure'
                ? 'text-[#4edea3] border-b-2 border-[#4edea3]'
                : 'text-[#bbcabf] hover:text-[#dde4dd]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Infrastructure</span>
          </button>
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Google Threat Intel Quick Button */}
        {onOpenThreatIntel && (
          <button
            onClick={onOpenThreatIntel}
            title="Google Search Grounded CVE & Threat Intel"
            className="hidden sm:flex items-center gap-1.5 bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] hover:border-[#4edea3]/60 px-3 py-1.5 rounded-lg text-xs font-medium text-[#bbcabf] hover:text-[#4edea3] transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#4edea3]" />
            <span className="hidden lg:inline">Threat Intel</span>
          </button>
        )}

        {/* Live Voice Copilot Quick Button */}
        {onOpenVoice && (
          <button
            onClick={onOpenVoice}
            title="Launch Aegis Voice AI Copilot"
            className="flex items-center gap-1.5 bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4edea3] transition-all duration-150 shadow-[0_0_10px_rgba(78,222,163,0.15)]"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden md:inline">Voice Copilot</span>
          </button>
        )}

        {/* Search quick button */}
        <div 
          onClick={onOpenSearch}
          className="hidden xl:flex items-center gap-2 bg-[#1F2937]/90 border border-[#3c4a42] px-3 py-1.5 rounded-lg text-xs text-[#bbcabf] cursor-pointer hover:border-[#4edea3]/50 transition-colors w-44"
        >
          <Search className="w-3.5 h-3.5 text-[#86948a]" />
          <span className="truncate">Search repo / ID...</span>
          <kbd className="ml-auto font-mono text-[10px] bg-[#0e1511] px-1.5 py-0.5 rounded border border-[#3c4a42] text-[#86948a]">⌘K</kbd>
        </div>

        {/* Download Project ZIP */}
        <a
          href="/api/download-zip"
          download="opentrust-source-code.zip"
          className="hidden sm:flex items-center gap-1.5 bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] hover:border-[#4edea3] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4edea3] transition-colors"
          title="Download full project source code as a ZIP archive"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Download ZIP</span>
        </a>

        {/* Action Button: Analyze New Repository */}
        <button
          onClick={onAnalyzeNew}
          className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline whitespace-nowrap">Analyze Repo</span>
        </button>

        {/* Notifications */}
        <button 
          onClick={() => onSelectTab('behavior')}
          title="Security Notifications"
          className="relative p-2 rounded-lg text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#1a211d] transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fc7c78] ring-2 ring-[#0e1511] animate-pulse" />
          )}
        </button>

        {/* User Auth Profile Badge */}
        {user ? (
          <button 
            onClick={onOpenAuth}
            className="h-8 w-8 rounded-full overflow-hidden border border-[#4edea3] hover:scale-105 transition-all cursor-pointer flex items-center justify-center shrink-0 ring-2 ring-[#4edea3]/20"
            title={`${user.displayName || user.email} (Firebase Connected)`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Analyst'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#242c27] flex items-center justify-center text-[#4edea3] text-xs font-bold font-mono">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] hover:border-[#4edea3] px-3 py-1.5 rounded-lg text-xs font-medium text-[#dde4dd] transition-colors"
            title="Sign In with Google via Firebase"
          >
            <LogIn className="w-3.5 h-3.5 text-[#4edea3]" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
