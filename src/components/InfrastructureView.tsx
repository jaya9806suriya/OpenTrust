import React from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  ShieldCheck, 
  Terminal, 
  Zap,
  RotateCw,
  AlertCircle
} from 'lucide-react';

export const InfrastructureView: React.FC = () => {
  const nodes = [
    { id: 'node-sg-01', region: 'asia-southeast1', status: 'Target Spec', sandboxes: 'Isolated MicroVM', cpu: 'Planned', mem: 'Planned', runtime: 'Container Runtime' },
    { id: 'node-sg-02', region: 'asia-southeast1', status: 'Target Spec', sandboxes: 'Isolated MicroVM', cpu: 'Planned', mem: 'Planned', runtime: 'Container Runtime' },
    { id: 'node-us-01', region: 'us-central1', status: 'Target Spec', sandboxes: 'Isolated MicroVM', cpu: 'Planned', mem: 'Planned', runtime: 'Container Runtime' },
    { id: 'node-eu-01', region: 'europe-west1', status: 'Target Spec', sandboxes: 'Isolated MicroVM', cpu: 'Planned', mem: 'Planned', runtime: 'Container Runtime' },
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
            The multi-region cluster telemetry below illustrates our planned production architecture. The current live demo executes in a <strong>controlled Node.js subprocess execution environment with scoped dummy credentials and strict execution timeouts</strong>.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Sandbox Infrastructure</h2>
            <span className="text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              Roadmap Concept
            </span>
          </div>
          <p className="text-sm text-[#bbcabf]">
            Target architecture for distributed multi-tenant microVM runner clusters.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>PLANNED CLUSTER TOPOLOGY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-85">
        <div className="surface-glass rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a] mb-2">
            <span>TARGET CONTAINMENT</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">Dedicated MicroVMs</div>
          <p className="text-xs text-[#bbcabf] mt-1">Multi-tenant kernel isolation runtime (Planned)</p>
        </div>

        <div className="surface-glass rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a] mb-2">
            <span>TARGET TRACE ENGINE</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">Syscall Interceptors</div>
          <p className="text-xs text-[#bbcabf] mt-1">System call & socket trap instrumentation (Planned)</p>
        </div>

        <div className="surface-glass rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a] mb-2">
            <span>NETWORK POLICY</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">Network Sinkhole</div>
          <p className="text-xs text-[#bbcabf] mt-1">Egress blocking and loopback binding</p>
        </div>
      </div>

      <div className="surface-glass rounded-xl border border-white/10 overflow-hidden shadow-xl opacity-85">
        <div className="p-4 border-b border-[#3c4a42]/50 flex justify-between items-center bg-[#0e1511]/50">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            Planned Runner Clusters
          </h3>
          <span className="text-xs font-mono text-[#86948a]">
            Specification Only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#3c4a42]/50 text-[#86948a] uppercase bg-[#1a211d]/50">
                <th className="py-3.5 px-5">Node ID</th>
                <th className="py-3.5 px-5">Region</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Target Engine</th>
                <th className="py-3.5 px-5">CPU Allocation</th>
                <th className="py-3.5 px-5">RAM Allocation</th>
                <th className="py-3.5 px-5">Isolation Layer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4a42]/30 text-[#dde4dd]">
              {nodes.map((n) => (
                <tr key={n.id} className="hover:bg-[#242c27]/50 transition-colors">
                  <td className="py-3.5 px-5 text-white font-semibold">{n.id}</td>
                  <td className="py-3.5 px-5 text-[#bbcabf]">{n.region}</td>
                  <td className="py-3.5 px-5">
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-white">{n.sandboxes}</td>
                  <td className="py-3.5 px-5 text-[#bbcabf]">{n.cpu}</td>
                  <td className="py-3.5 px-5 text-[#bbcabf]">{n.mem}</td>
                  <td className="py-3.5 px-5 text-amber-300">{n.runtime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
