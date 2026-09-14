import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Printer,
  Shield,
  Church,
  ChevronDown,
  User,
  Fingerprint,
  Compass,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { BibleTranslation, UserRole, SyncState, UserAccount } from '../types';
import { GlobalVoiceListener } from './GlobalVoiceListener';

interface TopBarProps {
  appName: string;
  churchName: string;
  logoUrl?: string;
  onOpenMobileSidebar: () => void;
  selectedTranslation: BibleTranslation;
  onSelectTranslation: (version: BibleTranslation) => void;
  syncState: SyncState;
  onTriggerSync: () => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  currentUserRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenSearch: () => void;
  onOpenPrint: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  activeToolId?: string;
  onNavigateTo?: (toolId: string) => void;
  onOpenTour?: () => void;
  onOpenThinkBible?: () => void;
}

const ALL_ROLES: UserRole[] = [
  'Super Administrator',
  'Pastor/Minister',
  'Church Administrator',
  'Ministry Leader',
  'Fellowship Leader',
  'Teacher',
  'Member'
];

export const TopBar: React.FC<TopBarProps> = ({
  appName,
  churchName,
  logoUrl,
  onOpenMobileSidebar,
  selectedTranslation,
  onSelectTranslation,
  syncState,
  onTriggerSync,
  theme,
  onToggleTheme,
  currentUserRole,
  onSelectRole,
  onOpenSearch,
  onOpenPrint,
  currentUser,
  onOpenAuth,
  activeToolId = 'dashboard',
  onNavigateTo = (_toolId: string) => {},
  onOpenTour,
  onOpenThinkBible
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      id="app-top-navigation-bar"
      className={`h-16 px-4 md:px-6 sticky top-0 z-30 transition-colors duration-200 border-b flex items-center justify-between no-print
        ${isDark 
          ? 'bg-[#0B1F4D]/95 backdrop-blur-md border-indigo-950/80 text-white' 
          : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
        }
      `}
    >
      {/* Left Section: Mobile Menu + Church Branding */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="topbar-mobile-menu-trigger"
          onClick={onOpenMobileSidebar}
          aria-label="Toggle navigation drawer"
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0B1F4D] to-[#7D3AC1] flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <Church className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif-cinzel font-bold text-sm tracking-tight truncate">
              {churchName || appName}
            </span>
            <span className="text-[10px] text-[#7D3AC1] dark:text-[#D4AF37] font-semibold tracking-wider uppercase truncate">
              {appName}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Tools & Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          id="topbar-search-btn"
          onClick={onOpenSearch}
          title="Search Bible, Sermons, Members, Events"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 hover:border-[#7D3AC1] dark:hover:border-[#D4AF37] text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400">⌘K</kbd>
        </button>

        {/* Bible Translation Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="bible-translation-select" className="sr-only">Bible Translation</label>
          <select
            id="bible-translation-select"
            value={selectedTranslation}
            onChange={(e) => onSelectTranslation(e.target.value as BibleTranslation)}
            title="Select Global Scripture Translation"
            className={`appearance-none text-xs font-semibold px-2.5 py-1.5 pr-7 rounded-lg border transition-colors cursor-pointer
              ${isDark 
                ? 'bg-slate-900/90 border-slate-800 text-amber-300 hover:border-amber-400' 
                : 'bg-slate-50 border-slate-200 text-[#0B1F4D] hover:border-[#7D3AC1]'
              }
            `}
          >
            <option value="KJV">Bible: KJV (King James)</option>
            <option value="NASB">Bible: NASB (Standard)</option>
            <option value="NIV">Bible: NIV (New Intl)</option>
            <option value="NLT">Bible: NLT (Living)</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Sync Status Badge & Manual Trigger */}
        <button
          id="topbar-sync-status-btn"
          onClick={onTriggerSync}
          title={`Status: ${syncState.syncStatus.toUpperCase()} (Click to Sync Now)`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors
            ${syncState.syncStatus === 'synced'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : syncState.syncStatus === 'syncing'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }
          `}
        >
          {syncState.syncStatus === 'synced' ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : syncState.syncStatus === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span className="hidden lg:inline capitalize">
            {syncState.syncStatus === 'synced' ? 'Online' : syncState.syncStatus}
          </span>
        </button>

        {/* Global Voice Navigation Listener (Web Speech API) */}
        <GlobalVoiceListener
          activeToolId={activeToolId}
          onNavigateTo={onNavigateTo}
        />

        {/* Feature Tour Button */}
        {onOpenTour && (
          <button
            id="topbar-tour-btn"
            onClick={onOpenTour}
            title="Take an Interactive Feature Tour"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#7D3AC1]/10 dark:bg-[#D4AF37]/15 text-[#7D3AC1] dark:text-[#D4AF37] border border-[#7D3AC1]/20 dark:border-[#D4AF37]/30 hover:bg-[#7D3AC1]/20 transition-all active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}

        {/* ThinkBible AI Assistant Button */}
        {onOpenThinkBible && (
          <button
            id="topbar-thinkbible-btn"
            onClick={onOpenThinkBible}
            title="Ask ThinkBible AI Assistant"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white shadow-xs hover:opacity-95 transition-all active:scale-95 border border-[#D4AF37]/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">ThinkBible</span>
          </button>
        )}

        {/* Subscriptions & Billing Button */}
        <button
          id="topbar-billing-btn"
          onClick={() => onNavigateTo('billing')}
          title="Manage Subscriptions & Billing ($19.99/Monthly & $199.99/yearly)"
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
            activeToolId === 'billing'
              ? 'bg-[#7D3AC1] text-white border-[#7D3AC1] shadow-xs'
              : 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Billing & Plans</span>
        </button>

        {/* Print / PDF Document Action */}
        <button
          id="topbar-print-action-btn"
          onClick={onOpenPrint}
          title="Print or Export Document to PDF"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] transition-colors"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          id="topbar-theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Role Selector */}
        <div className="relative flex items-center">
          <label htmlFor="user-role-select" className="sr-only">User Role</label>
          <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
            <Shield className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37] shrink-0" />
            <select
              id="user-role-select"
              value={currentUserRole}
              onChange={(e) => onSelectRole(e.target.value as UserRole)}
              title="Active User Role (Security Profile)"
              className="appearance-none bg-transparent text-xs font-semibold text-[#7D3AC1] dark:text-[#D4AF37] cursor-pointer pr-4 focus:outline-hidden"
            >
              {ALL_ROLES.map((role) => (
                <option key={role} value={role} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-purple-400 absolute right-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Firebase & Biometric Account Trigger */}
        <button
          id="topbar-auth-btn"
          onClick={onOpenAuth}
          title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign In with Google / Biometrics'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentUser
              ? 'bg-[#0B1F4D] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
              : 'bg-[#7D3AC1] hover:bg-[#6023A1] text-white shadow-xs'
          }`}
        >
          {currentUser ? (
            <>
              {currentUser.isBiometricEnrolled ? (
                <Fingerprint className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              )}
              <span className="hidden sm:inline max-w-[90px] truncate">
                {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Minister'}
              </span>
            </>
          ) : (
            <>
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
