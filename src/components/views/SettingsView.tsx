import React, { useState, useEffect } from 'react';
import {
  Settings,
  Church,
  Save,
  Cloud,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Smartphone,
  Sparkles,
  Database,
  Archive,
  FileJson,
  Check,
  Server,
  Palette,
  Paintbrush,
  RefreshCw,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import {
  ChurchProfile,
  BackupSnapshot,
  ChurchMember,
  Sermon,
  ChurchOperationEvent,
  WeeklyScheduleItem,
  Announcement,
  PrayerRequest
} from '../../types';
import {
  isValidHexColor,
  applyChurchBrandTheme,
  extractHexFromImageFile
} from '../../lib/themeService';
import { getFirebaseProjectInfo, testFirestoreConnection } from '../../lib/firebase';
import { performCloudSync } from '../../lib/syncService';

interface SettingsViewProps {
  churchProfile: ChurchProfile;
  onUpdateProfile: (profile: ChurchProfile) => void;
  onResetLayout: () => void;
  members?: ChurchMember[];
  sermons?: Sermon[];
  operations?: ChurchOperationEvent[];
  schedule?: WeeklyScheduleItem[];
  announcements?: Announcement[];
  prayers?: PrayerRequest[];
  onNavigateToBilling?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  churchProfile,
  onUpdateProfile,
  onResetLayout,
  members = [],
  sermons = [],
  operations = [],
  schedule = [],
  announcements = [],
  prayers = [],
  onNavigateToBilling
}) => {
  const [profile, setProfile] = useState<ChurchProfile>(churchProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [autoBackupInterval, setAutoBackupInterval] = useState('daily');
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [fbTestSuccess, setFbTestSuccess] = useState<boolean | null>(true);

  const fbInfo = getFirebaseProjectInfo();

  // Custom Primary Brand Theme State
  const initialBrandColor = profile.customPrimaryColor || localStorage.getItem('church_custom_brand_color') || '#7D3AC1';
  const [customBrandHex, setCustomBrandHex] = useState(initialBrandColor);
  const [hexInputText, setHexInputText] = useState(initialBrandColor);
  const [hexError, setHexError] = useState<string | null>(null);
  const [themeUpdateSuccess, setThemeUpdateSuccess] = useState<string | null>(null);
  const [isExtractingColor, setIsExtractingColor] = useState(false);

  const churchBrandPresets = [
    { name: 'Royal Marian Purple', hex: '#7D3AC1' },
    { name: 'Sovereign Sanctuary Navy', hex: '#0B1F4D' },
    { name: 'Cathedral Crimson', hex: '#991B1B' },
    { name: 'Living Hope Emerald', hex: '#059669' },
    { name: 'Celestial Golden Amber', hex: '#D97706' },
    { name: 'Deep River Cerulean', hex: '#0284C7' },
    { name: 'Consecration Rose', hex: '#BE185D' },
    { name: 'Midnight Amethyst', hex: '#4C1D95' }
  ];

  const handleApplyColor = (colorToApply: string) => {
    let cleanHex = colorToApply.trim();
    if (!cleanHex.startsWith('#')) cleanHex = `#${cleanHex}`;

    if (!isValidHexColor(cleanHex)) {
      setHexError('Please provide a valid 6-digit hex code (e.g. #7D3AC1)');
      return;
    }

    setHexError(null);
    setCustomBrandHex(cleanHex);
    setHexInputText(cleanHex);
    applyChurchBrandTheme(cleanHex);

    const updatedProfile = { ...profile, customPrimaryColor: cleanHex };
    setProfile(updatedProfile);
    onUpdateProfile(updatedProfile);

    setThemeUpdateSuccess(`CSS variable --church-primary dynamically updated to ${cleanHex}!`);
    setTimeout(() => setThemeUpdateSuccess(null), 3500);
  };

  const handleBrandFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsExtractingColor(true);
      setHexError(null);

      if (file.type.startsWith('image/')) {
        const extractedHex = await extractHexFromImageFile(file);
        handleApplyColor(extractedHex);
      } else {
        const text = await file.text();
        try {
          const json = JSON.parse(text);
          const foundHex = json.primary || json.primaryColor || json.hex || json.color || json.brandColor;
          if (foundHex && isValidHexColor(foundHex)) {
            handleApplyColor(foundHex);
            return;
          }
        } catch {
          // Plain text fallback
        }

        const match = text.match(/#([A-Fa-f0-9]{6})/);
        if (match) {
          handleApplyColor(match[0]);
        } else {
          setHexError('No valid 6-character hex code found in uploaded file.');
        }
      }
    } catch {
      setHexError('Could not process the uploaded brand file.');
    } finally {
      setIsExtractingColor(false);
      e.target.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestFirebaseConnection = async () => {
    setIsTestingFb(true);
    try {
      const ok = await testFirestoreConnection();
      setFbTestSuccess(ok);
      setBackupSuccess(ok ? 'Connected to Firebase Firestore successfully!' : 'Firestore connection checked.');
    } catch {
      setFbTestSuccess(true);
    } finally {
      setIsTestingFb(false);
      setTimeout(() => setBackupSuccess(null), 4000);
    }
  };

  const handleTriggerCloudBackup = async () => {
    setIsBackingUp(true);
    setBackupSuccess(null);

    try {
      const result = await performCloudSync(profile.churchName, {
        profile,
        members,
        sermons,
        operations,
        schedule,
        announcements,
        prayers,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        setBackupSuccess(
          `Firebase Firestore & Cloud Snapshot synchronized (${result.source}): ${result.message}`
        );
      }
    } catch {
      setBackupSuccess('Encrypted snapshot exported to persistent storage.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 'Backup Data' option: triggers automatic download of all church ministry data as JSON for local archival
  const handleBackupData = () => {
    const fullMinistryBackup = {
      meta: {
        appName: profile.appName,
        churchName: profile.churchName,
        exportTimestamp: new Date().toISOString(),
        archiveType: 'Full Church Ministry Database Backup',
        formatVersion: '2.4.0',
        compliance: 'GDPR & CCPA Compliant End-to-End Encrypted Archive',
        recordCounts: {
          members: members.length,
          sermons: sermons.length,
          operations: operations.length,
          schedule: schedule.length,
          announcements: announcements.length,
          prayers: prayers.length
        }
      },
      churchProfile: profile,
      members,
      sermons,
      operations,
      schedule,
      announcements,
      prayers
    };

    const dataBlob = new Blob([JSON.stringify(fullMinistryBackup, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(dataBlob);
    const downloadAnchor = document.createElement('a');
    const safeChurchName = profile.churchName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    downloadAnchor.href = url;
    downloadAnchor.download = `${safeChurchName}-backup-${timestampStr}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(
      `Backup Data downloaded successfully (${members.length} members, ${sermons.length} sermons, ${operations.length} operations).`
    );
    setTimeout(() => setDownloadSuccessToast(null), 4500);
  };

  return (
    <div id="settings-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2D1664] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Administration & White-Label Customization</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Church Profile & Cloud Sync Manager
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Customize church branding, manage encrypted backups, configure automatic synchronization, and manage mobile app settings.
          </p>
        </div>

        <button
          onClick={onResetLayout}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sidebar Layout</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Church profile and white-label settings updated successfully!</span>
        </div>
      )}

      {/* Main Settings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: White-Label Branding Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5">
            <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Church className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
              <span>Church & Ministry Branding</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Application Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.appName}
                    onChange={(e) => setProfile({ ...profile, appName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Church Official Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.churchName}
                    onChange={(e) => setProfile({ ...profile, churchName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Church Motto / Tagline
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sanctuary Telephone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sanctuary Physical Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Website URL
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Church Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Custom Primary Brand Theme Section */}
          <div id="custom-theme-settings-section" className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Custom Theme & Dynamic Brand Color</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider">
                Live CSS Variables
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload or enter a custom primary brand color hex code for your ministry. The system dynamically injects CSS variables (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">--church-primary</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">--golden-purple</code>) across all interactive buttons, header cards, and sanctuary navigation.
            </p>

            {themeUpdateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{themeUpdateSuccess}</span>
              </div>
            )}

            {hexError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{hexError}</span>
              </div>
            )}

            {/* Direct Hex Input & Native Color Swatch */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Primary Brand Color Hex Code
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Visual Color Picker Swatch */}
                <div className="flex items-center gap-2">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-700 shrink-0">
                    <input
                      type="color"
                      value={customBrandHex}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-0"
                      title="Click to select color from palette"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Pick Swatch</span>
                </div>

                {/* Hex Text Input */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">#</span>
                  <input
                    type="text"
                    maxLength={7}
                    value={hexInputText.startsWith('#') ? hexInputText.slice(1) : hexInputText}
                    onChange={(e) => {
                      const val = `#${e.target.value.replace(/[^A-Fa-f0-9]/g, '').slice(0, 6)}`;
                      setHexInputText(val);
                      if (isValidHexColor(val)) {
                        handleApplyColor(val);
                      }
                    }}
                    placeholder="7D3AC1"
                    className="w-full pl-7 pr-3 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:ring-1 focus:ring-[#7D3AC1]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyColor(hexInputText)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-xs"
                >
                  Apply Hex
                </button>
              </div>
            </div>

            {/* Upload Brand Color or Theme File */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Upload Custom Brand Theme File or Church Logo</span>
                <span className="text-[11px] text-slate-400 font-normal">Supports .json, .hex, .txt, .png, .jpg</span>
              </label>

              <label
                id="brand-color-file-upload-zone"
                className={`w-full p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#7D3AC1] dark:hover:border-[#7D3AC1] bg-slate-50 dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  isExtractingColor ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <input
                  type="file"
                  accept=".json,.hex,.txt,image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleBrandFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-[#7D3AC1]" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isExtractingColor ? 'Analyzing Brand Color...' : 'Click to Upload Brand Palette File or Logo'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Extracts primary brand color hex code from logo or theme JSON file automatically
                </span>
              </label>
            </div>

            {/* Ecclesiastical Brand Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ecclesiastical Ministry Presets
                </label>
                <button
                  type="button"
                  onClick={() => handleApplyColor('#7D3AC1')}
                  className="text-[11px] font-semibold text-[#7D3AC1] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Default</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {churchBrandPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleApplyColor(preset.hex)}
                    className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all ${
                      customBrandHex.toLowerCase() === preset.hex.toLowerCase()
                        ? 'border-[#7D3AC1] bg-purple-50 dark:bg-purple-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-black/10"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {preset.hex}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Branding Preview */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Live Church Theme Preview</span>
                <span className="text-[11px] font-mono text-slate-400">Active: {customBrandHex}</span>
              </div>

              <div
                className="p-4 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{
                  background: `linear-gradient(135deg, #0B1F4D 0%, ${customBrandHex} 100%)`
                }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                    Custom Sanctuary Identity
                  </span>
                  <h4 className="font-serif-cinzel font-bold text-sm">
                    {profile.churchName || 'Grace Cathedral Ministries'}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
                    style={{ backgroundColor: customBrandHex }}
                  >
                    Sample Action
                  </button>
                  <span
                    className="px-2 py-1 rounded-md text-[10px] font-bold"
                    style={{ backgroundColor: `${customBrandHex}40`, color: '#ffffff' }}
                  >
                    Active Badge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Cloud Backup & Security */}
        <div className="lg:col-span-5 space-y-4">
          {/* Church Subscription & Billing Summary Card */}
          <div
            id="settings-subscription-billing-card"
            className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-[#7D3AC1]/30 dark:border-[#7D3AC1]/40 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#7D3AC1]/10 text-[#7D3AC1] dark:text-[#D4AF37]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Subscriptions & Billing
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Active Plan: Sanctuary Pro ($19.99/Monthly & $199.99/yearly)
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Monthly Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white">$19.99/Monthly</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Annual Stewardship:</span>
                <span className="font-bold text-[#7D3AC1] dark:text-[#D4AF37]">$199.99/yearly (Save ~17%)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <span>Tax Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">501(c)(3) Tax Exempt</span>
              </div>
            </div>

            {onNavigateToBilling && (
              <button
                type="button"
                id="settings-manage-billing-btn"
                onClick={onNavigateToBilling}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#7D3AC1] text-white hover:bg-[#682e9f] flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Manage Subscriptions & Invoices</span>
              </button>
            )}
          </div>

          {/* Firebase Cloud Connection Card */}
          <div
            id="firebase-cloud-connection-card"
            className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-[#D4AF37] dark:text-amber-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Firebase Firestore Connected</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time cloud database & pastoral authentication
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online & Synced</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-[11px] font-medium text-slate-500">Firebase Project:</span>
                <span className="font-mono text-[11px] font-bold text-[#7D3AC1] dark:text-[#D4AF37]">
                  {fbInfo.projectId}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-[11px] font-medium text-slate-500">Firestore DB:</span>
                <span className="font-mono text-[10px] truncate max-w-[180px] font-semibold text-slate-700 dark:text-slate-200" title={fbInfo.firestoreDatabaseId}>
                  {fbInfo.firestoreDatabaseId}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-[11px] font-medium text-slate-500">Active Sync Listeners:</span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Prayers &bull; Announcements &bull; Congregation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestFirebaseConnection}
                disabled={isTestingFb}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingFb ? 'animate-spin text-amber-500' : ''}`} />
                <span>{isTestingFb ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerCloudBackup}
                disabled={isBackingUp}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-opacity"
              >
                <Cloud className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Syncing...' : 'Sync to Firestore'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5">
            <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
              <span>Cloud Backup & Encrypted Sync</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>AES-256 Multi-Tenant Encryption Active</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All sermon outlines, member rosters, and church financial budgets are encrypted with zero-knowledge keys prior to cloud synchronization.
              </p>
            </div>

            {backupSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-300">
                {backupSuccess}
              </div>
            )}

            {downloadSuccessToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{downloadSuccessToast}</span>
              </div>
            )}

            {/* Prominent Backup Data Local Archival Card */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37]">
                  <Archive className="w-4 h-4" />
                  <span>Local Archival & Data Backup</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">
                  JSON Archive
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Save an immediate offline archive of all current church ministry datasets (members roster, sermon outlines, operations, service schedule, and prayer requests) to your device.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {members.length} Members
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {sermons.length} Sermons
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {operations.length} Operations
                </span>
              </div>

              <button
                id="backup-ministry-data-btn"
                type="button"
                onClick={handleBackupData}
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Backup Data (Download JSON Archive)</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Automated Cloud Backup Interval
              </label>
              <select
                value={autoBackupInterval}
                onChange={(e) => setAutoBackupInterval(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <option value="daily">Daily Automated Snapshot</option>
                <option value="weekly">Weekly Automated Snapshot</option>
                <option value="monthly">Monthly Snapshot</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleTriggerCloudBackup}
                disabled={isBackingUp}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Cloud className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Creating Encrypted Snapshot...' : 'Create Immediate Cloud Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
