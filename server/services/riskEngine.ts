import { StaticFinding } from './staticAnalyzer';
import { BehaviorEvent } from './observer';

export interface ScoreBreakdownItem {
  label: string;
  points: number;
  color: 'primary' | 'error' | 'tertiary' | 'neutral';
}

export interface RiskEvaluation {
  trustScore: number;
  verdict: 'TRUST' | 'REVIEW' | 'BLOCK';
  breakdown: ScoreBreakdownItem[];
  riskFlags: {
    id: string;
    title: string;
    details: string;
    type: 'error' | 'warning' | 'info';
    icon: string;
  }[];
  verdictReason: string;
}

export function evaluateRisk(
  staticFindings: StaticFinding[],
  behaviorEvents: BehaviorEvent[],
  vulnerableDeps: number
): RiskEvaluation {
  let score = 100;
  const breakdown: ScoreBreakdownItem[] = [
    { label: 'Base Security Score', points: 100, color: 'primary' }
  ];
  const riskFlags: RiskEvaluation['riskFlags'] = [];

  // 1. Static Analysis Deductions
  const criticalStatic = staticFindings.filter(f => f.severity === 'Critical').length;
  const highStatic = staticFindings.filter(f => f.severity === 'High').length;
  const mediumStatic = staticFindings.filter(f => f.severity === 'Medium').length;

  if (criticalStatic > 0 || highStatic > 0 || mediumStatic > 0) {
    const staticDeduction = Math.min(40, criticalStatic * 25 + highStatic * 15 + mediumStatic * 8);
    score -= staticDeduction;
    breakdown.push({
      label: `Static Code Inspection (${criticalStatic + highStatic + mediumStatic} findings)`,
      points: -staticDeduction,
      color: 'error'
    });

    riskFlags.push({
      id: 'FLAG-STATIC',
      title: 'High-Risk Syntax Patterns Detected',
      details: `${highStatic + criticalStatic} high-severity code execution or file-access patterns flagged in static AST.`,
      type: 'error',
      icon: 'AlertTriangle'
    });
  }

  // 2. Behavioral Deductions
  const sensitiveFileEvt = behaviorEvents.find(e => e.category === 'File' && e.severity === 'HIGH');
  if (sensitiveFileEvt) {
    score -= 30;
    breakdown.push({
      label: 'Sensitive Host File Traversal Attempt',
      points: -30,
      color: 'error'
    });
    riskFlags.push({
      id: 'FLAG-FILE',
      title: 'Attempted Host Credential Access',
      details: 'Process attempted unauthorized read on fake_home/.ssh/demo_id_rsa.txt',
      type: 'error',
      icon: 'Lock'
    });
  }

  const envHarvestEvt = behaviorEvents.find(e => e.category === 'Environment' && e.severity === 'HIGH');
  if (envHarvestEvt) {
    score -= 25;
    breakdown.push({
      label: 'Environment Secret Harvesting',
      points: -25,
      color: 'error'
    });
    riskFlags.push({
      id: 'FLAG-ENV',
      title: 'Environment Credential Harvesting',
      details: 'Detected process scanning for AWS_SECRET_ACCESS_KEY and API tokens.',
      type: 'error',
      icon: 'Key'
    });
  }

  const networkEvt = behaviorEvents.find(e => e.category === 'Network' && (e.severity === 'HIGH' || e.severity === 'MEDIUM'));
  if (networkEvt) {
    score -= 15;
    breakdown.push({
      label: 'Outbound Network Socket Attempt',
      points: -15,
      color: 'tertiary'
    });
    riskFlags.push({
      id: 'FLAG-NET',
      title: 'External Network Egress Attempted',
      details: 'Container captured connection attempt towards remote endpoint.',
      type: 'warning',
      icon: 'Globe'
    });
  }

  const processEvt = behaviorEvents.find(e => e.category === 'Process' && e.severity === 'MEDIUM');
  if (processEvt) {
    score -= 15;
    breakdown.push({
      label: 'Unauthorized Subprocess Spawn',
      points: -15,
      color: 'tertiary'
    });
    riskFlags.push({
      id: 'FLAG-PROC',
      title: 'Subprocess Execution',
      details: 'Process invoked external system command execution.',
      type: 'warning',
      icon: 'Terminal'
    });
  }

  // 3. Dependency Deductions
  if (vulnerableDeps > 0) {
    const depDeduction = Math.min(20, vulnerableDeps * 10);
    score -= depDeduction;
    breakdown.push({
      label: `Suspicious Dependencies (${vulnerableDeps} identified)`,
      points: -depDeduction,
      color: 'tertiary'
    });
    riskFlags.push({
      id: 'FLAG-DEP',
      title: 'Supply Chain Anomaly',
      details: `${vulnerableDeps} dependency manifests match known high-risk naming patterns.`,
      type: 'warning',
      icon: 'ShieldAlert'
    });
  }

  // Clamp final score to 0..100
  const finalScore = Math.max(0, Math.min(100, score));

  let verdict: 'TRUST' | 'REVIEW' | 'BLOCK' = 'TRUST';
  let verdictReason = 'Clean repository profile. No credential theft or unauthorized process execution observed.';

  if (finalScore < 50) {
    verdict = 'BLOCK';
    verdictReason = 'Hostile behavioral indicators detected: unauthorized credential harvesting or sensitive file access attempted.';
  } else if (finalScore < 80) {
    verdict = 'REVIEW';
    verdictReason = 'Moderate risk profile: static patterns or outbound network egress require manual review before integration.';
  }

  return {
    trustScore: finalScore,
    verdict,
    breakdown,
    riskFlags,
    verdictReason
  };
}
