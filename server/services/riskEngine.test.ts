import { evaluateRisk } from './riskEngine';
import { StaticFinding } from './staticAnalyzer';
import { BehaviorEvent } from './observer';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Running OpenTrust Risk Engine Unit Tests ---');

// Test 1: Clean Repository
{
  const result = evaluateRisk([], [], 0);
  assert(result.trustScore === 100, `Clean repo must have Trust Score 100 (got ${result.trustScore})`);
  assert(result.verdict === 'TRUST', `Clean repo verdict must be TRUST (got ${result.verdict})`);
  assert(result.riskFlags.length === 0, `Clean repo must have 0 risk flags (got ${result.riskFlags.length})`);
}

// Test 2: High & Critical Severity Static Findings
{
  const staticFindings: StaticFinding[] = [
    {
      id: 'FIND-1',
      ruleId: 'PY-DYN-EXEC',
      category: 'Dynamic Execution',
      severity: 'Critical',
      title: 'Dynamic Code Execution via eval()',
      description: 'eval() executes arbitrary code strings',
      location: 'main.py:12',
      line: 12,
      snippet: 'eval(code)',
      remediation: 'Use ast.literal_eval'
    },
    {
      id: 'FIND-2',
      ruleId: 'PY-SUBPROC',
      category: 'Process Spawning',
      severity: 'High',
      title: 'Subprocess Execution',
      description: 'subprocess.run executes shell commands',
      location: 'main.py:25',
      line: 25,
      snippet: 'subprocess.run(["sh", "-c"])',
      remediation: 'Avoid raw shell'
    }
  ];

  const result = evaluateRisk(staticFindings, [], 0);
  // Deduction: Math.min(40, 1*25 + 1*15) = 40. Score: 100 - 40 = 60.
  assert(result.trustScore === 60, `Static findings should deduct 40 points (got score ${result.trustScore})`);
  assert(result.verdict === 'REVIEW', `Score 60 should produce REVIEW verdict (got ${result.verdict})`);
  assert(result.riskFlags.some(f => f.id === 'FLAG-STATIC'), 'Risk flags should include FLAG-STATIC');
}

// Test 3: Sensitive File Access & Hostile Credential Traversal
{
  const events: BehaviorEvent[] = [
    {
      id: 'EVT-1',
      time: '00:03',
      category: 'File',
      severity: 'HIGH',
      title: 'Sensitive Host File Access',
      details: 'Read requested on fake_home/.ssh/demo_id_rsa.txt',
      timestamp: Date.now(),
      status: 'blocked'
    },
    {
      id: 'EVT-2',
      time: '00:04',
      category: 'Environment',
      severity: 'HIGH',
      title: 'Environment Credential Read Attempt',
      details: 'Queried AWS_SECRET_ACCESS_KEY',
      timestamp: Date.now(),
      status: 'flagged'
    }
  ];

  const result = evaluateRisk([], events, 0);
  // Deductions: -30 (file) + -25 (env) = -55 -> Score 45
  assert(result.trustScore === 45, `Sensitive file + env harvesting should result in score 45 (got ${result.trustScore})`);
  assert(result.verdict === 'BLOCK', `Score 45 must produce BLOCK verdict (got ${result.verdict})`);
  assert(result.riskFlags.some(f => f.id === 'FLAG-FILE'), 'Risk flags should include FLAG-FILE');
  assert(result.riskFlags.some(f => f.id === 'FLAG-ENV'), 'Risk flags should include FLAG-ENV');
}

// Test 4: Boundary Scores (80, 79, 50, 49) and Clamping
{
  // Deduct 20 (vulnerable deps * 2 = 20) -> Score 80 -> TRUST
  const result80 = evaluateRisk([], [], 2);
  assert(result80.trustScore === 80, `Score 80 check (got ${result80.trustScore})`);
  assert(result80.verdict === 'TRUST', `Boundary score 80 must be TRUST (got ${result80.verdict})`);

  // Score 70 (process 15 + dep 15 -> -30 -> 70) -> REVIEW
  const procEvents: BehaviorEvent[] = [
    {
      id: 'EVT-PROC',
      time: '00:05',
      category: 'Process',
      severity: 'MEDIUM',
      title: 'Subprocess Invocation',
      details: 'sh -c whoami',
      timestamp: Date.now(),
      status: 'flagged'
    },
    {
      id: 'EVT-NET',
      time: '00:06',
      category: 'Network',
      severity: 'HIGH',
      title: 'Network Egress',
      details: 'Outbound TCP connection',
      timestamp: Date.now(),
      status: 'blocked'
    }
  ];
  const result70 = evaluateRisk([], procEvents, 0);
  // -15 (proc) -15 (net) = -30 -> Score 70
  assert(result70.trustScore === 70, `Score 70 check (got ${result70.trustScore})`);
  assert(result70.verdict === 'REVIEW', `Score 70 must be REVIEW (got ${result70.verdict})`);

  // Over-deduction clamping to minimum 0
  const heavyStatic: StaticFinding[] = Array(5).fill({
    id: 'F', ruleId: 'R', category: 'Dynamic Execution', severity: 'Critical', title: 'T', description: 'D', location: 'f:1', line: 1, snippet: 'c', remediation: 'r'
  });
  const heavyEvents: BehaviorEvent[] = [
    { id: 'E1', time: '1', category: 'File', severity: 'HIGH', title: 'F', details: 'D', timestamp: 1, status: 'blocked' },
    { id: 'E2', time: '2', category: 'Environment', severity: 'HIGH', title: 'E', details: 'D', timestamp: 2, status: 'flagged' },
    { id: 'E3', time: '3', category: 'Network', severity: 'HIGH', title: 'N', details: 'D', timestamp: 3, status: 'blocked' },
    { id: 'E4', time: '4', category: 'Process', severity: 'MEDIUM', title: 'P', details: 'D', timestamp: 4, status: 'flagged' }
  ];
  const result0 = evaluateRisk(heavyStatic, heavyEvents, 5);
  // Total raw deduction: -40 -30 -25 -15 -15 -20 = -145 -> Score clamped to 0
  assert(result0.trustScore === 0, `Heavy deduction must clamp to 0 (got ${result0.trustScore})`);
  assert(result0.verdict === 'BLOCK', `Score 0 must be BLOCK (got ${result0.verdict})`);
}

console.log('🎉 All OpenTrust Risk Engine Unit Tests Passed Successfully!');
