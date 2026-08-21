import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Sparkles, 
  User as UserIcon, 
  Database,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { signInWithGoogle, logOut } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setErrorMsg(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logOut();
      onClose();
    } catch (err: any) {
      console.error('Sign out failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1511] border border-[#3c4a42] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3c4a42]/60 bg-[#141b16] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4edea3]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">OpenTrust Authentication</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a211d] border border-[#3c4a42] text-[#bbcabf] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#fc7c78]/10 border border-[#fc7c78]/30 flex items-start gap-2.5 text-[#fc7c78] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#1a211d] border border-[#3c4a42]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border border-[#4edea3]/40 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#242c27] border border-[#3c4a42] flex items-center justify-center text-[#4edea3]">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {user.displayName || 'Security Analyst'}
                  </h4>
                  <p className="text-xs text-[#86948a] truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Firebase Authenticated
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141b16] border border-[#3c4a42]/50 text-xs text-[#bbcabf] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#86948a]">Firestore Sync:</span>
                  <span className="text-[#4edea3]">Active & Protected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86948a]">Role:</span>
                  <span className="text-white">Lead Security Auditor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86948a]">UID:</span>
                  <span className="text-[#86948a] truncate max-w-[150px]">{user.uid}</span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1a211d] hover:bg-[#fc7c78]/10 text-[#fc7c78] border border-[#fc7c78]/30 hover:border-[#fc7c78] font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Sign In to OpenTrust</h4>
                <p className="text-xs text-[#bbcabf] mt-1 max-w-xs mx-auto">
                  Authenticate with Google to enable real-time Firestore synchronization, persistent repository audit trails, and team compliance policies.
                </p>
              </div>

              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#86948a] font-mono">
                <Database className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>Powered by Firebase Auth & Firestore</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
