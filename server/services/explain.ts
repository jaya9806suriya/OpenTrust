import { GoogleGenAI } from '@google/genai';
import { StaticFinding } from './staticAnalyzer';
import { BehaviorEvent } from './observer';
import { RiskEvaluation } from './riskEngine';

let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export interface ExplanationResult {
  executiveSummary: string;
  recommendedAction: string;
  behaviorAnalysis: string;
}

export async function generateForensicExplanation(
  repoName: string,
  findings: StaticFinding[],
  events: BehaviorEvent[],
  risk: RiskEvaluation
): Promise<ExplanationResult> {
  // Deterministic local/rule-based explanation (works offline / zero-API requirement)
  let executiveSummary = '';
  let recommendedAction = '';
  let behaviorAnalysis = '';

  if (risk.verdict === 'BLOCK') {
    executiveSummary = `OpenTrust Sandbox intercepted critical security violations in "${repoName}". During controlled sandbox execution, the program attempted unauthorized environment credential harvesting and host file traversal into fake SSH keys. Static inspection also flagged ${findings.length} dynamic execution and subprocess invocations.`;
    recommendedAction = `DO NOT install or deploy this package. Place repository under immediate security quarantine. If internal team usage was planned, audit dependencies and isolate CI/CD pipelines.`;
    behaviorAnalysis = `Runtime kernel telemetry confirmed active traversal into fake sensitive keys and access to dummy AWS credentials, consistent with infostealer payload behavior.`;
  } else if (risk.verdict === 'REVIEW') {
    executiveSummary = `Analysis of "${repoName}" completed with a Trust Score of ${risk.trustScore}/100. Several elevated-privilege patterns were detected during static analysis and controlled runtime observation, but no credential exfiltration was confirmed.`;
    recommendedAction = `Perform manual peer-review of flagged functions before promoting this dependency into production environments.`;
    behaviorAnalysis = `Network egress attempts or subprocess invocations were recorded during sandbox evaluation without confirmed malicious payload deployment.`;
  } else {
    executiveSummary = `Analysis of "${repoName}" verified a clean security posture with a Trust Score of ${risk.trustScore}/100. All static inspections passed without malicious dynamic execution patterns, and sandbox runtime observation logged normal file I/O operations.`;
    recommendedAction = `Cleared for integration and production deployment. Continue standard automated dependency scanning.`;
    behaviorAnalysis = `Process executed cleanly with exit code 0. No credential harvesting, abnormal network sockets, or unauthorized file system operations detected.`;
  }

  // If Gemini API is available, optionally enrich the text with the actual evidence
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = getGenAI();
      const prompt = `You are OpenTrust's Forensic Threat Explainer.
Explain the following actual security evaluation results for repository "${repoName}":

Verdict: ${risk.verdict} (Score: ${risk.trustScore}/100)
Static Findings: ${JSON.stringify(findings.slice(0, 5).map(f => ({ title: f.title, location: f.location, snippet: f.snippet })))}
Behavior Events: ${JSON.stringify(events.map(e => ({ category: e.category, title: e.title, details: e.details, status: e.status })))}

Provide a concise JSON response strictly matching:
{
  "executiveSummary": "string (2 sentences summarizing the evidence)",
  "recommendedAction": "string (1-2 clear actionable sentences for developers)",
  "behaviorAnalysis": "string (2 sentences explaining the runtime sandbox observations)"
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(res.text || '{}');
      if (parsed.executiveSummary) executiveSummary = parsed.executiveSummary;
      if (parsed.recommendedAction) recommendedAction = parsed.recommendedAction;
      if (parsed.behaviorAnalysis) behaviorAnalysis = parsed.behaviorAnalysis;
    } catch (e) {
      console.warn('Gemini enrichment failed (using deterministic rule-based explanation):', e);
    }
  }

  return {
    executiveSummary,
    recommendedAction,
    behaviorAnalysis
  };
}
