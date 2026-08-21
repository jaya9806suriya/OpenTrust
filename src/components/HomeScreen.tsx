import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FolderArchive, 
  UploadCloud, 
  Lock, 
  FolderGit2, 
  Cpu, 
  Eye, 
  BrainCircuit, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Code2,
  Mic,
  Globe,
  LogIn,
  Download
} from 'lucide-react';
import { User } from 'firebase/auth';
import { NavigationTab } from '../types';

interface HomeScreenProps {
  onStartAnalysis: (target: string | File, type: 'github' | 'zip', demoMode?: 'safe' | 'suspicious') => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenVoice?: () => void;
  onOpenThreatIntel?: () => void;
  onOpenAuth?: () => void;
  user?: User | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartAnalysis,
  onNavigateTab,
  onOpenVoice,
  onOpenThreatIntel,
  onOpenAuth,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'zip'>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'github') {
      const url = githubUrl.trim() || 'https://github.com/opentrust-demo/crypto-helper';
      onStartAnalysis(url, 'github', url.includes('safe') ? 'safe' : 'suspicious');
    } else {
      if (selectedFile) {
        onStartAnalysis(selectedFile, 'zip', 'suspicious');
      } else {
        onStartAnalysis(selectedFileName || 'archive-package.zip', 'zip', 'suspicious');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      onStartAnalysis(file, 'zip', 'suspicious');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      onStartAnalysis(file, 'zip', 'suspicious');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1511] text-[#dde4dd] relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#4edea3]/5 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#c0c1ff]/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center w-full px-6 md:px-12 h-16 bg-[#0e1511]/80 backdrop-blur-xl border-b border-[#3c4a42]/50 sticky top-0 z-50 shadow-sm">
        <div 
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded bg-[#4edea3]/20 flex items-center justify-center border border-[#4edea3]/30">
            <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
          </div>
          <span className="text-xl font-bold text-[#4edea3] tracking-tight">OpenTrust</span>
        </div>

        <nav className="hidden md:flex gap-8">
          <button onClick={() => onNavigateTab('home')} className="text-[#4edea3] border-b-2 border-[#4edea3] pb-1 font-medium text-sm">Home</button>
          <button onClick={() => onNavigateTab('pipeline')} className="text-[#bbcabf] hover:text-[#4edea3] transition-colors font-medium text-sm">Pipeline</button>
          <button onClick={() => onNavigateTab('overview')} className="text-[#bbcabf] hover:text-[#4edea3] transition-colors font-medium text-sm">Repositories</button>
          <button onClick={() => onNavigateTab('compliance')} className="text-[#bbcabf] hover:text-[#4edea3] transition-colors font-medium text-sm">Compliance</button>
        </nav>

        <div className="flex items-center gap-3">
          {onOpenThreatIntel && (
            <button
              onClick={onOpenThreatIntel}
              className="hidden lg:flex items-center gap-1.5 bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] px-3 py-1.5 rounded-lg text-xs font-medium text-[#bbcabf] hover:text-[#4edea3] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>Google Threat Intel</span>
            </button>
          )}

          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="hidden sm:flex items-center gap-1.5 bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4edea3] transition-all"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Voice Copilot</span>
            </button>
          )}

          {/* Download Project ZIP */}
          <a
            href="/api/download-zip"
            download="opentrust-source-code.zip"
            className="flex items-center gap-1.5 bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] hover:border-[#4edea3] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4edea3] transition-colors"
            title="Download full project source code as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download ZIP</span>
          </a>

          {user ? (
            <button
              onClick={onOpenAuth}
              className="h-8 w-8 rounded-full overflow-hidden border border-[#4edea3] ring-2 ring-[#4edea3]/20 flex items-center justify-center cursor-pointer"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#4edea3] font-bold text-xs">{user.email?.charAt(0).toUpperCase()}</span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-[#1a211d] hover:bg-[#242c27] border border-[#3c4a42] hover:border-[#4edea3] px-3 py-1.5 rounded-lg text-xs font-medium text-[#dde4dd] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#4edea3]" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button 
            onClick={() => onStartAnalysis('https://github.com/opentrust-demo/crypto-helper', 'github', 'suspicious')}
            className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] active:scale-95"
          >
            Analyze Repository
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-12 mt-4">
          <h1 className="text-4xl md:text-5xl lg:text-[48px] font-bold mb-6 leading-tight tracking-tight text-white">
            See What Code Does <br />
            <span className="text-[#4edea3]">Before You Run It.</span>
          </h1>
          <p className="text-base md:text-lg text-[#bbcabf] leading-relaxed max-w-2xl mx-auto">
            Upload an unknown repository and OpenTrust safely inspects its code, observes its runtime behavior, evaluates risk, and explains the evidence.
          </p>
        </div>

        {/* Main Intake Card */}
        <div className="w-full max-w-2xl surface-glass rounded-xl p-6 md:p-8 mb-14 glow-primary relative border border-white/10 shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-[#3c4a42]/60 mb-6 pb-2 gap-8">
            <button
              onClick={() => setActiveTab('github')}
              className={`font-semibold text-sm pb-2.5 transition-all ${
                activeTab === 'github'
                  ? 'text-[#4edea3] border-b-2 border-[#4edea3] -mb-[10px]'
                  : 'text-[#bbcabf] hover:text-white'
              }`}
            >
              GitHub URL
            </button>
            <button
              onClick={() => setActiveTab('zip')}
              className={`font-semibold text-sm pb-2.5 transition-all ${
                activeTab === 'zip'
                  ? 'text-[#4edea3] border-b-2 border-[#4edea3] -mb-[10px]'
                  : 'text-[#bbcabf] hover:text-white'
              }`}
            >
              Upload ZIP
            </button>
          </div>

          {/* GitHub Input */}
          {activeTab === 'github' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="font-mono text-xs text-[#bbcabf] uppercase tracking-wider">
                Repository URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="e.g. https://github.com/psf/requests or pallets/flask"
                  className="flex-1 bg-[#1F2937] border border-[#3c4a42] rounded-lg px-4 py-3 text-sm text-[#dde4dd] placeholder:text-[#86948a] focus:outline-none focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] transition-all font-mono"
                />
                <button
                  type="submit"
                  className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] px-6 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] shrink-0 active:scale-95"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Inspect</span>
                </button>
              </div>

              {/* Sample Repository Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-[#86948a] uppercase tracking-wider font-mono">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setGithubUrl('https://github.com/psf/requests');
                    onStartAnalysis('https://github.com/psf/requests', 'github', 'safe');
                  }}
                  className="text-xs bg-[#1a211d] hover:bg-[#242c27] text-[#4edea3] hover:text-[#6ffbbe] border border-[#3c4a42] hover:border-[#4edea3]/50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-mono"
                >
                  <span>psf/requests</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded">Safe</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGithubUrl('https://github.com/pallets/flask');
                    onStartAnalysis('https://github.com/pallets/flask', 'github', 'safe');
                  }}
                  className="text-xs bg-[#1a211d] hover:bg-[#242c27] text-[#4edea3] hover:text-[#6ffbbe] border border-[#3c4a42] hover:border-[#4edea3]/50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-mono"
                >
                  <span>pallets/flask</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded">Safe</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGithubUrl('https://github.com/opentrust-demo/crypto-helper');
                    onStartAnalysis('https://github.com/opentrust-demo/crypto-helper', 'github', 'suspicious');
                  }}
                  className="text-xs bg-[#1a211d] hover:bg-[#242c27] text-[#ff6b6b] hover:text-[#ff8787] border border-[#3c4a42] hover:border-[#ff6b6b]/50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-mono"
                >
                  <span>crypto-helper</span>
                  <span className="text-[10px] text-red-400 bg-red-950/60 px-1 rounded">Suspicious</span>
                </button>
              </div>
            </form>
          ) : (
            /* Upload ZIP */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                isDragging
                  ? 'border-[#4edea3] bg-[#4edea3]/10'
                  : 'border-[#3c4a42] hover:border-[#4edea3]/70 hover:bg-[#161d19]'
              }`}
            >
              <input
                type="file"
                accept=".zip,.tar,.gz,.tgz"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-10 h-10 text-[#86948a] mb-3" />
              <p className="text-sm font-medium text-[#dde4dd] mb-1">
                {selectedFileName ? `Selected: ${selectedFileName}` : 'Drag and drop a .zip file here'}
              </p>
              <p className="text-xs text-[#86948a]">or click to browse your files (max 100MB)</p>
            </div>
          )}

          {/* Guarantee Footer */}
          <div className="mt-6 flex items-center justify-between text-xs text-[#86948a] border-t border-[#3c4a42]/40 pt-4">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>Your repository is analyzed in an isolated sandbox environment.</span>
            </div>
          </div>
        </div>

        {/* Pipeline Infographic */}
        <div className="w-full max-w-4xl mb-14 hidden md:block">
          <h3 className="font-mono text-xs text-[#86948a] uppercase tracking-widest text-center mb-8">
            Analysis Pipeline
          </h3>
          <div className="flex justify-between items-center relative">
            {/* Connecting Line */}
            <div className="absolute left-8 right-8 top-6 h-[2px] bg-[#3c4a42] -z-0 transform -translate-y-1/2" />

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2.5 bg-[#0e1511] px-3 z-10">
              <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center border border-white/10 hover:border-[#4edea3] transition-colors">
                <FolderArchive className="w-5 h-5 text-[#dde4dd]" />
              </div>
              <span className="font-mono text-xs text-[#bbcabf]">Repository</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2.5 bg-[#0e1511] px-3 z-10">
              <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center border border-white/10 hover:border-[#4edea3] transition-colors">
                <FolderGit2 className="w-5 h-5 text-[#c0c1ff]" />
              </div>
              <span className="font-mono text-xs text-[#bbcabf]">Inspect</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2.5 bg-[#0e1511] px-3 z-10">
              <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center border border-white/10 hover:border-[#4edea3] transition-colors">
                <Cpu className="w-5 h-5 text-[#ffb3af]" />
              </div>
              <span className="font-mono text-xs text-[#bbcabf]">Sandbox</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2.5 bg-[#0e1511] px-3 z-10">
              <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center border border-white/10 hover:border-[#4edea3] transition-colors">
                <Eye className="w-5 h-5 text-[#4edea3]" />
              </div>
              <span className="font-mono text-xs text-[#bbcabf]">Observe</span>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center gap-2.5 bg-[#0e1511] px-3 z-10">
              <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center border border-white/10 hover:border-[#4edea3] transition-colors">
                <BrainCircuit className="w-5 h-5 text-[#dde4dd]" />
              </div>
              <span className="font-mono text-xs text-[#bbcabf]">Explain</span>
            </div>

            {/* Step 6 */}
            <div className="flex flex-col items-center gap-2.5 bg-[#0e1511] px-3 z-10">
              <div className="w-12 h-12 rounded-full bg-[#4edea3]/20 border border-[#4edea3] flex items-center justify-center glow-primary">
                <ShieldCheck className="w-6 h-6 text-[#4edea3]" />
              </div>
              <span className="font-mono text-xs text-[#4edea3] font-semibold">Trust</span>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="w-full max-w-3xl">
          <h3 className="font-mono text-xs text-[#86948a] uppercase tracking-widest text-center mb-6">
            Try a Demo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Safe Demo */}
            <div 
              onClick={() => onStartAnalysis('https://github.com/opentrust-demo/safe-utils', 'github', 'safe')}
              className="surface-glass rounded-lg p-5 border-l-4 border-l-[#4edea3] hover:bg-[#2f3632]/50 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] border border-white/5"
            >
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                  <span className="font-semibold text-sm text-white">Safe Demo</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#86948a] group-hover:text-[#4edea3] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-[#bbcabf] mb-3.5 leading-relaxed">
                Analyze a standard utility library with expected, benign network behavior.
              </p>
              <div className="font-mono text-[11px] bg-[#242c27] px-2.5 py-1 rounded inline-block text-[#bbcabf] border border-white/5">
                github.com/opentrust-demo/safe-utils
              </div>
            </div>

            {/* Suspicious Demo */}
            <div 
              onClick={() => onStartAnalysis('https://github.com/opentrust-demo/crypto-helper', 'github', 'suspicious')}
              className="surface-glass rounded-lg p-5 border-l-4 border-l-[#ffb4ab] hover:bg-[#2f3632]/50 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] border border-white/5"
            >
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                  <span className="font-semibold text-sm text-white">Suspicious Demo</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#86948a] group-hover:text-[#ffb4ab] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-[#bbcabf] mb-3.5 leading-relaxed">
                Analyze a repository simulating obfuscated code and unauthorized external connections.
              </p>
              <div className="font-mono text-[11px] bg-[#242c27] px-2.5 py-1 rounded inline-block text-[#bbcabf] border border-white/5">
                github.com/opentrust-demo/crypto-helper
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
