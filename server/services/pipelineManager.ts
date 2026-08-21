import { processZipBuffer, processDemoRepo, processGithubRepo, createAnalysisId, IntakeResult } from './intake';
import { runStaticInspection, StaticInspectionResult } from './staticAnalyzer';
import { runControlledSandbox, SandboxExecutionResult } from './observer';
import { evaluateRisk, RiskEvaluation } from './riskEngine';
import { generateForensicExplanation, ExplanationResult } from './explain';

export type PipelineStageName = 'INTAKE' | 'INSPECT' | 'SANDBOX' | 'OBSERVE' | 'EXPLAIN' | 'TRUST SCORE';

export interface PipelineSessionData {
  id: string;
  targetRepo: string;
  repoUrl?: string;
  repoType: 'github' | 'zip';
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentStageIndex: number;
  currentStageName: PipelineStageName;
  stages: {
    id: string;
    stageNumber: string;
    name: string;
    status: 'completed' | 'running' | 'pending' | 'failed';
    icon: string;
    description: string;
  }[];
  elapsedSeconds: number;
  filesScanned: number;
  intake?: IntakeResult;
  staticResult?: StaticInspectionResult;
  sandboxResult?: SandboxExecutionResult;
  riskResult?: RiskEvaluation;
  explanation?: ExplanationResult;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

// In-memory session registry
const activeSessions = new Map<string, PipelineSessionData>();

const INITIAL_STAGES = [
  { id: '1', stageNumber: '01', name: 'INTAKE', status: 'pending' as const, icon: 'Download', description: 'Validate archive integrity and extract source tree' },
  { id: '2', stageNumber: '02', name: 'INSPECT', status: 'pending' as const, icon: 'ShieldCheck', description: 'Run static AST analysis and dependency manifests' },
  { id: '3', stageNumber: '03', name: 'SANDBOX', status: 'pending' as const, icon: 'Terminal', description: 'Execute in controlled subprocess environment with scoped variables' },
  { id: '4', stageNumber: '04', name: 'OBSERVE', status: 'pending' as const, icon: 'Eye', description: 'Capture process, file, environment, and network telemetry' },
  { id: '5', stageNumber: '05', name: 'EXPLAIN', status: 'pending' as const, icon: 'FileText', description: 'Generate forensic threat synthesis and remediation' },
  { id: '6', stageNumber: '06', name: 'TRUST SCORE', status: 'pending' as const, icon: 'ShieldAlert', description: 'Calculate Trust Score and output cryptographic verdict' }
];

export function getSession(id: string): PipelineSessionData | undefined {
  return activeSessions.get(id);
}

export function getAllSessions(): PipelineSessionData[] {
  return Array.from(activeSessions.values());
}

export async function startZipAnalysis(
  zipBuffer: Buffer,
  filename: string
): Promise<PipelineSessionData> {
  const intake = await processZipBuffer(zipBuffer, filename);
  const session: PipelineSessionData = {
    id: intake.analysisId,
    targetRepo: intake.repoName,
    repoType: 'zip',
    status: 'running',
    currentStageIndex: 0,
    currentStageName: 'INTAKE',
    stages: INITIAL_STAGES.map((st, i) => ({ ...st, status: i === 0 ? 'running' : 'pending' })),
    elapsedSeconds: 0,
    filesScanned: intake.totalFiles,
    intake,
    startedAt: Date.now()
  };

  activeSessions.set(session.id, session);
  runFullPipeline(session);
  return session;
}

export async function startDemoAnalysis(
  demoType: 'safe' | 'suspicious'
): Promise<PipelineSessionData> {
  const intake = await processDemoRepo(demoType);
  const session: PipelineSessionData = {
    id: intake.analysisId,
    targetRepo: intake.repoName,
    repoType: 'github',
    repoUrl: demoType === 'safe' ? 'https://github.com/opentrust/safe-data-analytics' : 'https://github.com/opentrust-demo/crypto-helper',
    status: 'running',
    currentStageIndex: 0,
    currentStageName: 'INTAKE',
    stages: INITIAL_STAGES.map((st, i) => ({ ...st, status: i === 0 ? 'running' : 'pending' })),
    elapsedSeconds: 0,
    filesScanned: intake.totalFiles,
    intake,
    startedAt: Date.now()
  };

  activeSessions.set(session.id, session);
  runFullPipeline(session);
  return session;
}

export async function startCustomRepoAnalysis(
  repoUrl: string
): Promise<PipelineSessionData> {
  const analysisId = createAnalysisId();
  try {
    const intake = await processGithubRepo(repoUrl, analysisId);
    const session: PipelineSessionData = {
      id: intake.analysisId,
      targetRepo: intake.repoName,
      repoType: 'github',
      repoUrl: repoUrl,
      status: 'running',
      currentStageIndex: 0,
      currentStageName: 'INTAKE',
      stages: INITIAL_STAGES.map((st, i) => ({ ...st, status: i === 0 ? 'running' : 'pending' })),
      elapsedSeconds: 0,
      filesScanned: intake.totalFiles,
      intake,
      startedAt: Date.now()
    };

    activeSessions.set(session.id, session);
    runFullPipeline(session);
    return session;
  } catch (err: any) {
    const errorMsg = err?.message || 'Could not fetch repository — check the URL or verify that it is a public repository';
    const failedSession: PipelineSessionData = {
      id: analysisId,
      targetRepo: repoUrl,
      repoType: 'github',
      repoUrl: repoUrl,
      status: 'failed',
      currentStageIndex: 0,
      currentStageName: 'INTAKE',
      stages: INITIAL_STAGES.map((st, i) => ({ ...st, status: i === 0 ? 'failed' : 'pending' })),
      elapsedSeconds: 0,
      filesScanned: 0,
      error: errorMsg,
      startedAt: Date.now()
    };
    activeSessions.set(failedSession.id, failedSession);
    return failedSession;
  }
}

async function runFullPipeline(session: PipelineSessionData) {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    // Stage 1: INTAKE
    session.currentStageIndex = 0;
    session.currentStageName = 'INTAKE';
    session.stages[0].status = 'running';
    await sleep(700);
    session.stages[0].status = 'completed';

    // Stage 2: INSPECT (Real Static Analysis)
    session.currentStageIndex = 1;
    session.currentStageName = 'INSPECT';
    session.stages[1].status = 'running';
    
    if (session.intake) {
      session.staticResult = await runStaticInspection(
        session.intake.workspacePath,
        session.intake.files
      );
      session.filesScanned = session.staticResult.filesScanned || session.intake.totalFiles;
    }
    await sleep(1000);
    session.stages[1].status = 'completed';

    // Stage 3: SANDBOX (Spawn sandbox)
    session.currentStageIndex = 2;
    session.currentStageName = 'SANDBOX';
    session.stages[2].status = 'running';
    await sleep(900);
    session.stages[2].status = 'completed';

    // Stage 4: OBSERVE (Controlled execution & telemetry)
    session.currentStageIndex = 3;
    session.currentStageName = 'OBSERVE';
    session.stages[3].status = 'running';

    if (session.intake) {
      session.sandboxResult = await runControlledSandbox(
        session.intake.workspacePath,
        session.intake.files
      );
    }
    await sleep(1200);
    session.stages[3].status = 'completed';

    // Stage 5: EXPLAIN & Risk Calculation
    session.currentStageIndex = 4;
    session.currentStageName = 'EXPLAIN';
    session.stages[4].status = 'running';

    const findings = session.staticResult?.findings || [];
    const events = session.sandboxResult?.events || [];
    const vulnerableDeps = session.staticResult?.dependenciesVulnerable || 0;

    session.riskResult = evaluateRisk(findings, events, vulnerableDeps);
    session.explanation = await generateForensicExplanation(
      session.targetRepo,
      findings,
      events,
      session.riskResult
    );
    await sleep(1000);
    session.stages[4].status = 'completed';

    // Stage 6: TRUST SCORE (Finalize)
    session.currentStageIndex = 5;
    session.currentStageName = 'TRUST SCORE';
    session.stages[5].status = 'running';
    await sleep(600);
    session.stages[5].status = 'completed';

    session.status = 'completed';
    session.completedAt = Date.now();
    session.elapsedSeconds = Math.round((Date.now() - session.startedAt) / 1000);
  } catch (err: any) {
    console.error(`Pipeline failure for ${session.id}:`, err);
    session.status = 'failed';
    session.error = err.message || 'Pipeline execution failed';
  }
}
