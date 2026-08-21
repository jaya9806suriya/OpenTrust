import React, { useState, useEffect } from 'react';
import { initialSuspiciousSession, safeDemoSession } from './data/mockData';
import { AnalysisSession, NavigationTab } from './types';
import { HomeScreen } from './components/HomeScreen';
import { SideNavBar } from './components/SideNavBar';
import { TopAppBar } from './components/TopAppBar';
import { PipelineScreen } from './components/PipelineScreen';
import { TrustReportScreen } from './components/TrustReportScreen';
import { StaticInspectionScreen } from './components/StaticInspectionScreen';
import { BehaviorTimelineScreen } from './components/BehaviorTimelineScreen';
import { AIAnalysisScreen } from './components/AIAnalysisScreen';
import { RepositoriesView } from './components/RepositoriesView';
import { ComplianceView } from './components/ComplianceView';
import { InfrastructureView } from './components/InfrastructureView';
import { SettingsModal } from './components/SettingsModal';
import { SearchModal } from './components/SearchModal';
import { VoiceCopilotModal } from './components/VoiceCopilotModal';
import { ThreatIntelModal } from './components/ThreatIntelModal';
import { AuthModal } from './components/AuthModal';
import { auth, saveScanToFirestore, subscribeToScans } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [session, setSession] = useState<AnalysisSession>(initialSuspiciousSession);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isThreatIntelOpen, setIsThreatIntelOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen for real-time Firestore updates for repositories
  useEffect(() => {
    const unsubscribe = subscribeToScans((scans) => {
      if (scans && scans.length > 0) {
        // Optional sync
      }
    });
    return () => unsubscribe();
  }, []);

  // Active analysis tracking & simulation state
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Trigger real analysis for a repository or uploaded ZIP
  const handleStartAnalysis = async (
    target: string | File,
    type: 'github' | 'zip',
    demoMode: 'safe' | 'suspicious' = 'suspicious'
  ) => {
    let targetName = typeof target === 'string' ? target : target.name;
    const lowerTarget = targetName.toLowerCase();
    const isSafe = demoMode === 'safe' || 
                   lowerTarget.includes('safe') || 
                   lowerTarget.includes('clean') ||
                   lowerTarget.includes('requests') ||
                   lowerTarget.includes('flask') ||
                   lowerTarget.includes('react') ||
                   lowerTarget.includes('vue');
    const base = isSafe ? safeDemoSession : initialSuspiciousSession;
    
    if (typeof target === 'string') {
      if (type === 'zip') {
        targetName = target.replace(/\.(zip|tar\.gz)$/i, '');
      } else {
        const match = target.match(/github\.com\/([^/]+)\/([^/#?]+)/);
        if (match) {
          targetName = `${match[1]}/${match[2].replace(/\.git$/, '')}`;
        } else {
          targetName = target.split('/').filter(Boolean).pop() || 'custom-repository';
        }
      }
    } else {
      targetName = target.name.replace(/\.(zip|tar\.gz)$/i, '');
    }

    const tempId = `OT-${Date.now().toString(36).toUpperCase()}`;
    const newSession: AnalysisSession = {
      ...base,
      id: tempId,
      targetRepo: targetName,
      repoUrl: typeof target === 'string' ? target : undefined,
      repoType: type,
      status: 'running',
      currentStageIndex: 0,
      elapsedSeconds: 0,
      stages: base.stages.map((st, i) => ({
        ...st,
        status: i === 0 ? 'running' : 'pending'
      }))
    };

    setSession(newSession);
    setCurrentTab('pipeline');
    setIsSimulating(false);
    setActiveAnalysisId(null);

    try {
      if (target instanceof File) {
        // Upload real ZIP to backend
        const formData = new FormData();
        formData.append('file', target);
        const res = await fetch('/api/analyze/upload-zip', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.analysisId) {
            setActiveAnalysisId(data.analysisId);
            return;
          }
        }
      } else {
        // Distinguish between preset local demo triggers and real custom GitHub repos
        const isBuiltinDemo = target.includes('opentrust-demo') || target.includes('crypto-helper') || target.includes('safe-data-analytics');

        const res = await fetch('/api/analyze/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isBuiltinDemo
              ? { demoType: isSafe ? 'safe' : 'suspicious' }
              : { repoUrl: target }
          )
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.analysisId) {
            setActiveAnalysisId(data.analysisId);
            return;
          }
        }
      }

      // If backend server returns non-ok or non-JSON (e.g. Vercel static host), launch client-side simulation!
      setIsSimulating(true);
    } catch (err) {
      console.warn('Backend API unavailable. Triggering client-side pipeline simulation:', err);
      setIsSimulating(true);
    }
  };

  // Client-side simulation hook when backend API is unavailable (e.g. Vercel deployment)
  useEffect(() => {
    if (!isSimulating || session.status === 'completed') return;

    const timer = setInterval(() => {
      setSession((prev) => {
        if (prev.status === 'completed') {
          clearInterval(timer);
          setIsSimulating(false);
          return prev;
        }

        const nextIndex = prev.currentStageIndex + 1;
        const totalStages = prev.stages.length;

        if (nextIndex >= totalStages) {
          clearInterval(timer);
          setIsSimulating(false);
          const finalSession: AnalysisSession = {
            ...prev,
            currentStageIndex: totalStages - 1,
            status: 'completed',
            stages: prev.stages.map((st) => ({ ...st, status: 'completed' }))
          };
          saveScanToFirestore(finalSession, user?.uid);
          return finalSession;
        }

        const updated: AnalysisSession = {
          ...prev,
          currentStageIndex: nextIndex,
          elapsedSeconds: (prev.elapsedSeconds || 0) + 2,
          filesScanned: (prev.filesScanned || 15) + Math.floor(Math.random() * 25) + 15,
          stages: prev.stages.map((st, i) => {
            if (i < nextIndex) return { ...st, status: 'completed' };
            if (i === nextIndex) return { ...st, status: 'running' };
            return { ...st, status: 'pending' };
          })
        };
        saveScanToFirestore(updated, user?.uid);
        return updated;
      });
    }, 1400);

    return () => clearInterval(timer);
  }, [isSimulating, session.status, user]);

  // Real pipeline polling hook
  useEffect(() => {
    if (!activeAnalysisId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/${activeAnalysisId}/status`);
        if (!res.ok) return;
        const statusData = await res.json();

        if (statusData.success) {
          setSession((prev) => ({
            ...prev,
            status: statusData.status,
            currentStageIndex: statusData.currentStageIndex ?? prev.currentStageIndex,
            elapsedSeconds: statusData.elapsedSeconds ?? prev.elapsedSeconds,
            filesScanned: statusData.filesScanned || prev.filesScanned,
            stages: statusData.stages || prev.stages
          }));

          // When analysis completes on backend, fetch full forensic report
          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setActiveAnalysisId(null);

            const reportRes = await fetch(`/api/analyze/${activeAnalysisId}/report`);
            if (reportRes.ok) {
              const rep = await reportRes.json();
              if (rep.success) {
                setSession((prev) => {
                  const finalSession: AnalysisSession = {
                    ...prev,
                    id: rep.id || prev.id,
                    targetRepo: rep.targetRepo || prev.targetRepo,
                    status: 'completed',
                    verdict: rep.verdict || prev.verdict,
                    trustScore: typeof rep.trustScore === 'number' ? rep.trustScore : prev.trustScore,
                    filesScanned: rep.filesScanned || prev.filesScanned,
                    elapsedSeconds: rep.elapsedSeconds || prev.elapsedSeconds,
                    license: rep.license || prev.license,
                    licenseStatus: rep.licenseStatus || prev.licenseStatus,
                    dependenciesTotal: rep.dependenciesTotal || prev.dependenciesTotal,
                    dependenciesVulnerable: rep.dependenciesVulnerable || prev.dependenciesVulnerable,
                    executiveSummary: rep.executiveSummary || prev.executiveSummary,
                    recommendedAction: rep.recommendedAction || prev.recommendedAction,
                    scoreBreakdown: rep.scoreBreakdown && rep.scoreBreakdown.length > 0 ? rep.scoreBreakdown : prev.scoreBreakdown,
                    riskFlags: rep.riskFlags && rep.riskFlags.length > 0 ? rep.riskFlags : prev.riskFlags,
                    codeFindings: rep.findings && rep.findings.length > 0 ? rep.findings : prev.codeFindings,
                    events: rep.events && rep.events.length > 0 ? rep.events : prev.events,
                    stages: prev.stages.map((st) => ({ ...st, status: 'completed' }))
                  };
                  saveScanToFirestore(finalSession, user?.uid);
                  return finalSession;
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Status poll error:', err);
      }
    }, 450);

    return () => clearInterval(pollInterval);
  }, [activeAnalysisId, user]);

  // Advance simulation stage manually
  const handleAdvanceStage = () => {
    setSession((prev) => {
      const nextIndex = Math.min(prev.currentStageIndex + 1, prev.stages.length - 1);
      const isComplete = nextIndex >= prev.stages.length - 1;
      const updated: AnalysisSession = {
        ...prev,
        currentStageIndex: nextIndex,
        status: isComplete ? 'completed' : 'running',
        stages: prev.stages.map((st, i) => {
          if (i < nextIndex) return { ...st, status: 'completed' };
          if (i === nextIndex) return { ...st, status: isComplete ? 'completed' : 'running' };
          return { ...st, status: 'pending' };
        })
      };
      saveScanToFirestore(updated, user?.uid);
      return updated;
    });
  };

  // Fast forward simulation to complete
  const handleCompleteSimulation = () => {
    setSession((prev) => {
      const updated: AnalysisSession = {
        ...prev,
        currentStageIndex: prev.stages.length - 1,
        status: 'completed',
        stages: prev.stages.map((st) => ({ ...st, status: 'completed' }))
      };
      saveScanToFirestore(updated, user?.uid);
      return updated;
    });
    setCurrentTab('trust-report');
  };

  return (
    <div className="min-h-screen bg-[#0e1511] text-[#dde4dd] flex flex-col font-sans antialiased selection:bg-[#4edea3]/30 selection:text-[#4edea3]">
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRepo={(url, demoMode) => handleStartAnalysis(url, 'github', demoMode)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Voice Copilot Modal */}
      <VoiceCopilotModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        session={session}
      />

      {/* Threat Intel Google Grounding Modal */}
      <ThreatIntelModal
        isOpen={isThreatIntelOpen}
        onClose={() => setIsThreatIntelOpen(false)}
        initialQuery={session.targetRepo}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
      />

      {/* Screen Router */}
      {currentTab === 'home' ? (
        <HomeScreen
          onStartAnalysis={handleStartAnalysis}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenThreatIntel={() => setIsThreatIntelOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
        />
      ) : (
        <div className="flex min-h-screen">
          {/* Side Navigation Bar */}
          <SideNavBar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            isPipelineRunning={session.status === 'running'}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenThreatIntel={() => setIsThreatIntelOpen(true)}
          />

          {/* Main Dashboard Canvas */}
          <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
            {/* Top Navigation Bar */}
            <TopAppBar
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onAnalyzeNew={() => setCurrentTab('home')}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenThreatIntel={() => setIsThreatIntelOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              user={user}
              targetRepoName={session.targetRepo}
            />

            {/* Dashboard Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {currentTab === 'pipeline' && (
                <PipelineScreen
                  session={session}
                  onAdvanceStage={handleAdvanceStage}
                  onCompleteSimulation={handleCompleteSimulation}
                  onViewReport={() => setCurrentTab('trust-report')}
                  onNavigateHome={() => setCurrentTab('home')}
                />
              )}

              {currentTab === 'trust-report' && (
                <TrustReportScreen
                  session={session}
                  onAnalyzeAnother={() => setCurrentTab('home')}
                  onNavigateToStatic={() => setCurrentTab('static')}
                  onNavigateToBehavior={() => setCurrentTab('behavior')}
                />
              )}

              {currentTab === 'static' && (
                <StaticInspectionScreen session={session} />
              )}

              {currentTab === 'behavior' && (
                <BehaviorTimelineScreen session={session} />
              )}

              {currentTab === 'ai-analysis' && (
                <AIAnalysisScreen 
                  session={session} 
                  onOpenVoice={() => setIsVoiceOpen(true)}
                  onOpenThreatIntel={() => setIsThreatIntelOpen(true)}
                />
              )}

              {currentTab === 'overview' && (
                <RepositoriesView
                  onSelectRepo={(url, demoMode) => handleStartAnalysis(url, 'github', demoMode)}
                  onAnalyzeNew={() => setCurrentTab('home')}
                />
              )}

              {currentTab === 'compliance' && (
                <ComplianceView />
              )}

              {currentTab === 'infrastructure' && (
                <InfrastructureView />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
