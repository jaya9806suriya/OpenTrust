import React from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const frameworks = [
    {
      name: 'SLSA Level 3 Framework (Planned)',
      description: 'Planned supply-chain build & provenance integrity verification.',
      status: 'Roadmap',
      score: 'Target 100%',
      items: ['Hermetic containerized sandboxing', 'Immutable SHA256 cryptographic digests', 'Zero build-time network egress']
    },
    {
      name: 'SOC2 Type II Controls (Planned)',
      description: 'Planned security, availability, and processing integrity tracking.',
      status: 'Roadmap',
      score: 'Target 95%+',
      items: ['Continuous audit trails', 'Role-based quarantine controls', 'Automated CVE scanning']
    },
    {
      name: 'Open Source License Matrix (Planned)',
      description: 'Planned commercial license matrix and copyleft viral contamination guardrails.',
      status: 'Roadmap',
      score: 'Target 90%+',
      items: ['MIT / Apache 2.0 / BSD Whitelisted', 'GPL v3 flagged for legal review', 'AGPL strictly quarantined']
    },
    {
      name: 'CIS Benchmark Suite (Planned)',
      description: 'Planned container hardening, rootless runtime enforcement, and capability drops.',
      status: 'Roadmap',
      score: 'Target 98%+',
      items: ['Drop Linux capabilities (CAP_DROP_ALL)', 'Seccomp profile enabled', 'Read-only root filesystem']
    }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* Prominent Roadmap Banner */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-300 uppercase tracking-wider font-mono">
            Roadmap Specification — Concept Preview (Not Yet Implemented in Current Engine)
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            The compliance frameworks and audit scores shown below are architectural design targets for enterprise integrations. Current live analysis in OpenTrust is driven exclusively by the <strong>Static AST Analyzer</strong>, <strong>Controlled Sandbox Observer</strong>, and <strong>Mathematical Risk Engine</strong>.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Compliance & Policy Engine</h2>
            <span className="text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              Roadmap Concept
            </span>
          </div>
          <p className="text-sm text-[#bbcabf]">
            Target enterprise compliance framework mapping (under active development).
          </p>
        </div>

        <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242c27]/50 text-[#86948a] border border-[#3c4a42]/50 cursor-not-allowed text-xs font-mono self-start sm:self-auto">
          <Lock className="w-4 h-4 text-[#86948a]" />
          <span>Export Audit (Roadmap)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-85">
        {frameworks.map((fw, idx) => (
          <div key={idx} className="surface-glass rounded-xl p-6 border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-base text-white">{fw.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {fw.status}
                </span>
              </div>
              <p className="text-xs text-[#bbcabf] mb-4 leading-relaxed">{fw.description}</p>

              <div className="space-y-2">
                {fw.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#dde4dd]">
                    <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#3c4a42]/50 flex justify-between items-center text-xs font-mono">
              <span className="text-[#86948a]">Target Benchmark:</span>
              <span className="font-bold text-amber-300">{fw.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
