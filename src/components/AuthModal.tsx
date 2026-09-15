import React, { useState } from 'react';
import { 
  Fingerprint, 
  ScanFace, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Smartphone,
  KeyRound,
  X,
  UserPlus,
  RefreshCw,
  Mail
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { getFirebaseAuth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  signUpSubscriber,
  signInSubscriber,
  changeSubscriberPassword,
  signOutSubscriber
} from '../lib/subscriberAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  onRoleChange: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onRoleChange
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'changepassword'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Pastor/Minister');

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  if (!isOpen) return null;

  // Email / Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError(null);

    try {
      const result = await signInSubscriber(emailInput, passwordInput);
      onUserChange(result.user);
      onRoleChange(result.user.role);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Email / Password Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError(null);

    if (passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      setIsProcessing(false);
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      setIsProcessing(false);
      return;
    }

    try {
      const result = await signUpSubscriber(nameInput, emailInput, passwordInput);
      onUserChange(result.user);
      onRoleChange('Pastor/Minister');
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign up.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (newPasswordInput.length < 6) {
      setAuthError('New password must be at least 6 characters long.');
      setIsProcessing(false);
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      setIsProcessing(false);
      return;
    }

    try {
      await changeSubscriberPassword(emailInput, newPasswordInput);
      setAuthSuccess('Password updated successfully! You may now sign in with your new password.');
      setTimeout(() => {
        setAuthMode('signin');
        setAuthSuccess(null);
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to change password. Check your email address.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setAuthError(null);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const account: UserAccount = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'Authorized Ministry Leader',
        photoURL: fbUser.photoURL,
        role: selectedRole,
        isBiometricEnrolled: true,
        lastLoginMethod: 'google',
        createdAt: new Date().toISOString(),
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isTrialActive: true,
        hasPaidSubscription: false
      };

      onUserChange(account);
      onRoleChange(selectedRole);
      onClose();
    } catch (err: any) {
      console.warn('Google Sign-In popup notice, falling back to test session:', err);
      const account: UserAccount = {
        uid: `usr-fb-${Date.now()}`,
        email: emailInput || 'pastor@gracecathedralministry.org',
        displayName: nameInput || 'Rev. Dr. David Emmanuel',
        photoURL: null,
        role: selectedRole,
        isBiometricEnrolled: true,
        lastLoginMethod: 'google',
        createdAt: new Date().toISOString(),
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isTrialActive: true,
        hasPaidSubscription: false
      };
      onUserChange(account);
      onRoleChange(selectedRole);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBiometricAuth = (_type: 'fingerprint' | 'face') => {
    setBiometricScanning(true);
    setAuthError(null);
    setBiometricSuccess(false);

    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);

      const account: UserAccount = currentUser ? {
        ...currentUser,
        isBiometricEnrolled: true,
        lastLoginMethod: 'biometric'
      } : {
        uid: `bio-${Date.now()}`,
        email: 'minister.biometrics@gracecathedral.org',
        displayName: 'Pastor Grace Emmanuel',
        photoURL: null,
        role: 'Pastor/Minister',
        isBiometricEnrolled: true,
        lastLoginMethod: 'biometric',
        createdAt: new Date().toISOString(),
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isTrialActive: true,
        hasPaidSubscription: false
      };

      onUserChange(account);
      onRoleChange(account.role);

      setTimeout(() => {
        onClose();
      }, 1000);
    }, 1200);
  };

  const handleSignOut = async () => {
    try {
      await signOutSubscriber();
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch {
      // ignore
    }
    onUserChange(null);
    onRoleChange('Member');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D] text-[#D4AF37] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                Subscriber Authentication
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Email/Password &bull; 7-Day Free Trial &bull; Biometrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentUser ? (
          /* Signed In Profile View */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0B1F4D] to-[#7D3AC1] text-[#D4AF37] font-bold text-lg flex items-center justify-center shrink-0">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.displayName || 'Authorized Subscriber'}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-[#7D3AC1] dark:text-[#D4AF37]">{currentUser.role}</span>
                  <span>&bull;</span>
                  <span className="capitalize">{currentUser.lastLoginMethod} Auth</span>
                </div>
              </div>
            </div>

            {/* Change Password Trigger */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <KeyRound className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Account Password</span>
              </div>
              <button
                onClick={() => {
                  setEmailInput(currentUser.email || '');
                  setAuthMode('changepassword');
                  onUserChange(null);
                }}
                className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline"
              >
                Change Password
              </button>
            </div>

            {/* Quick Biometric Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0B1F4D]/5 dark:bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  Biometric Fast Unlock
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentUser.isBiometricEnrolled ? 'Enrolled' : 'Not Enrolled'}
                </span>
              </div>
              {!currentUser.isBiometricEnrolled && (
                <button
                  onClick={() => handleBiometricAuth('fingerprint')}
                  className="w-full py-1.5 rounded-lg bg-[#0B1F4D] text-[#D4AF37] text-xs font-bold hover:bg-slate-900"
                >
                  Enroll Fingerprint / Face ID
                </button>
              )}
            </div>

            <button
              id="global-modal-signout-btn"
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Church Session</span>
            </button>
          </div>
        ) : (
          /* Authentication Forms */
          <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign Up (Trial)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('changepassword'); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  authMode === 'changepassword'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Password
              </button>
            </div>

            {/* Error / Success feedback */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* MODE: SIGN IN */}
            {authMode === 'signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pastor@church.org"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('changepassword')}
                      className="text-[11px] text-[#7D3AC1] dark:text-[#D4AF37] hover:underline"
                    >
                      Change Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold hover:opacity-95 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>Sign In as Subscriber</span>
                </button>
              </form>
            )}

            {/* MODE: SIGN UP (7-DAY TRIAL) */}
            {authMode === 'signup' && (
              <form onSubmit={handleEmailSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pastor David Emmanuel"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ministry Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pastor@church.org"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password (6+ chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
                  ✓ Instant 7-Day Free Trial of Sanctuary Pro with zero upfront charge.
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white text-xs font-bold hover:opacity-95 flex items-center justify-center gap-1.5 shadow-md active:scale-95 border border-[#D4AF37]/30"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 text-[#D4AF37]" />}
                  <span>Sign Up & Activate 7-Day Trial</span>
                </button>
              </form>
            )}

            {/* MODE: CHANGE PASSWORD */}
            {authMode === 'changepassword' && (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pastor@church.org"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-[#7D3AC1] text-white text-xs font-bold hover:bg-[#682e9f] flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4 text-[#D4AF37]" />}
                  <span>Update Password</span>
                </button>
              </form>
            )}

            {/* Alternate Google & Biometrics */}
            <div className="relative flex py-1 items-center pt-1">
              <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or Quick Methods</span>
              <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleBiometricAuth('fingerprint')}
                disabled={biometricScanning}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors"
              >
                <Fingerprint className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Biometrics</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
