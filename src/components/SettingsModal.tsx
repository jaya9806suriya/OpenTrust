import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sliders, 
  Bell, 
  Terminal, 
  Key, 
  Save, 
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [sandboxTimeout, setSandboxTimeout] = useState('60');
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [strictEBPF, setStrictEBPF] = useState(true);
  const [geminiApiKeySet, setGeminiApiKeySet] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="surface-glass rounded-2xl max-w-xl w-full p-6 md:p-8 border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-[#3c4a42]/60 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#4edea3]" />
            <h3 className="text-lg font-bold text-white tracking-tight">OpenTrust System Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#86948a] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs md:text-sm">
          <div>
            <label className="font-mono text-xs text-[#86948a] uppercase block mb-1.5">
              Sandbox Execution Timeout (Seconds)
            </label>
            <input
              type="number"
              value={sandboxTimeout}
              onChange={(e) => setSandboxTimeout(e.target.value)}
              className="w-full bg-[#1F2937] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-white font-mono focus:border-[#4edea3] outline-none"
            />
            <p className="text-[11px] text-[#86948a] mt-1">
              MicroVM execution duration before terminating and summarizing eBPF events.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1a211d] border border-[#3c4a42]">
            <div>
              <div className="font-semibold text-white">Auto-Enforce Quarantine on Score &lt; 40</div>
              <div className="text-xs text-[#86948a]">Automatically lock CI/CD pipeline and block repository clone.</div>
            </div>
            <input
              type="checkbox"
              checked={autoQuarantine}
              onChange={(e) => setAutoQuarantine(e.target.checked)}
              className="w-4 h-4 accent-[#4edea3] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1a211d] border border-[#3c4a42]">
            <div>
              <div className="font-semibold text-white">Strict eBPF Syscall Interception</div>
              <div className="text-xs text-[#86948a]">Trap file access to /etc, ~/.ssh, and undeclared network sockets.</div>
            </div>
            <input
              type="checkbox"
              checked={strictEBPF}
              onChange={(e) => setStrictEBPF(e.target.checked)}
              className="w-4 h-4 accent-[#4edea3] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1a211d] border border-[#3c4a42]">
            <div>
              <div className="font-semibold text-white">AI Copilot Engine</div>
              <div className="text-xs text-[#86948a]">Gemini 2.5 Security Heuristics Active via Cloud Run.</div>
            </div>
            <span className="font-mono text-xs text-[#4edea3] bg-[#10b981]/20 px-2 py-0.5 rounded border border-[#4edea3]/40">
              CONNECTED
            </span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#3c4a42]/60 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-[#242c27] text-xs font-mono text-[#bbcabf] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002113] font-semibold text-xs md:text-sm transition-all flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
