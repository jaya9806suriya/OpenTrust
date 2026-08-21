import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Cloud, 
  FileText, 
  Wifi, 
  Cpu, 
  Terminal, 
  AlertCircle,
  X,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { AnalysisSession, EventCategory, EventLog, SeverityLevel } from '../types';

interface BehaviorTimelineScreenProps {
  session: AnalysisSession;
}

export const BehaviorTimelineScreen: React.FC<BehaviorTimelineScreenProps> = ({ session }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EventLog | null>(null);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  const categories = ['All Events', 'Files', 'Processes', 'Network', 'Environment'];

  const filteredEvents = useMemo(() => {
    return session.events.filter((evt) => {
      // Category match
      if (selectedCategory === 'Files' && evt.category !== 'File') return false;
      if (selectedCategory === 'Processes' && evt.category !== 'Process') return false;
      if (selectedCategory === 'Network' && evt.category !== 'Network') return false;
      if (selectedCategory === 'Environment' && evt.category !== 'Environment') return false;

      // Severity match
      if (severityFilter !== 'ALL' && evt.severity !== severityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          evt.title.toLowerCase().includes(q) ||
          evt.details.toLowerCase().includes(q) ||
          evt.category.toLowerCase().includes(q) ||
          evt.time.includes(q)
        );
      }

      return true;
    });
  }, [session.events, selectedCategory, severityFilter, searchQuery]);

  const getCategoryIcon = (cat: EventCategory) => {
    switch (cat) {
      case 'Environment':
        return <Cloud className="w-4 h-4 text-[#c0c1ff]" />;
      case 'File':
        return <FileText className="w-4 h-4 text-[#ffb3af]" />;
      case 'Network':
        return <Wifi className="w-4 h-4 text-[#4edea3]" />;
      case 'Process':
        return <Cpu className="w-4 h-4 text-[#c0c1ff]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#86948a]" />;
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] shadow-[0_0_8px_rgba(255,180,171,0.8)]" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#fc7c78]/15 text-[#fc7c78] border border-[#fc7c78]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fc7c78]" />
            MEDIUM
          </span>
        );
      case 'LOW':
      case 'INFO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#10b981]/15 text-[#4edea3] border border-[#4edea3]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Behavioral Event Timeline
          </h2>
          <p className="text-sm text-[#bbcabf] max-w-2xl">
            Chronological tracking of system behavior anomalies, unauthorized access attempts, and critical execution paths.
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-56 md:w-64 bg-[#1F2937] border border-[#3c4a42] rounded-lg pl-9 pr-3 py-2 text-xs md:text-sm text-white placeholder:text-[#86948a] focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none transition-all font-mono"
            />
          </div>

          <button
            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
            className="flex items-center gap-2 bg-[#1a211d] border border-[#3c4a42] px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium text-[#dde4dd] hover:bg-[#242c27] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#4edea3]" />
            <span>Filters</span>
          </button>

          {/* Filter Dropdown */}
          {showFiltersDropdown && (
            <div className="absolute right-0 top-12 z-30 w-48 bg-[#0e1511] border border-[#3c4a42] rounded-xl p-3 shadow-2xl space-y-2 text-xs">
              <div className="font-mono text-[10px] uppercase text-[#86948a] mb-1">Filter by Severity</div>
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => { setSeverityFilter(sev); setShowFiltersDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-colors flex items-center justify-between ${
                    severityFilter === sev ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'text-[#bbcabf] hover:bg-[#1a211d]'
                  }`}
                >
                  <span>{sev}</span>
                  {severityFilter === sev && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="border-b border-[#3c4a42]/60">
        <nav className="flex gap-8 -mb-px overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`pb-3 font-semibold text-sm transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'border-b-2 border-[#4edea3] text-[#4edea3]'
                  : 'border-b-2 border-transparent text-[#bbcabf] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>

      {/* Timeline List Table */}
      <div className="surface-glass border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3c4a42]/50 bg-[#1a211d]/60 font-mono text-[11px] text-[#86948a] uppercase tracking-wider">
                <th className="py-4 px-6 w-32">Timestamp</th>
                <th className="py-4 px-6 w-44">Category</th>
                <th className="py-4 px-6 w-36">Severity</th>
                <th className="py-4 px-6">Action / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4a42]/30 text-xs md:text-sm">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#86948a] font-mono text-xs">
                    No matching events found for current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isSuspiciousRow = evt.details.includes('/etc/shadow') || evt.severity === 'HIGH';
                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`hover:bg-[#242c27]/60 transition-colors cursor-pointer group ${
                        isSuspiciousRow ? 'bg-[#93000a]/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-white font-mono">{evt.time}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5 text-[#dde4dd]">
                          {getCategoryIcon(evt.category)}
                          <span>{evt.category}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{getSeverityBadge(evt.severity)}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold ${evt.details.includes('/etc/shadow') ? 'text-[#ffb4ab]' : 'text-white'}`}>
                            {evt.title}
                          </span>
                          <span className="text-[#86948a] font-mono text-xs flex items-center gap-1.5">
                            {evt.command && <Terminal className="w-3.5 h-3.5 text-[#86948a]" />}
                            {evt.details}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Syscall Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-glass rounded-2xl max-w-2xl w-full p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-start mb-4 border-b border-[#3c4a42]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#ffb4ab]" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedEvent.title}</h3>
                  <p className="font-mono text-xs text-[#86948a]">Captured at {selectedEvent.time}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#86948a] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 font-mono text-xs">
              <div className="bg-[#1a211d] p-3 rounded-lg border border-[#3c4a42]">
                <div className="text-[#86948a] text-[10px] uppercase">Category</div>
                <div className="text-white mt-0.5">{selectedEvent.category}</div>
              </div>
              <div className="bg-[#1a211d] p-3 rounded-lg border border-[#3c4a42]">
                <div className="text-[#86948a] text-[10px] uppercase">Severity Impact</div>
                <div className="text-[#ffb4ab] mt-0.5 font-bold">{selectedEvent.severity}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="font-mono text-[11px] text-[#86948a] uppercase mb-1">eBPF Sandbox Trace:</div>
              <pre className="bg-[#09100c] text-[#4edea3] font-mono text-xs p-4 rounded-lg border border-[#3c4a42] overflow-x-auto">
                <code>{`[SYSCALL TRACE]
PID: ${selectedEvent.pid || 8492} | UID: 1000 (sandbox-worker)
COMM: ${selectedEvent.command || 'python3 -m sandbox.exec'}
EXEC: ${selectedEvent.details}
ACTION: BLOCKED BY OPENTRUST SECURITY ENGINE`}</code>
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-[#242c27] text-xs font-mono text-[#bbcabf] hover:text-white"
              >
                Close Forensics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
