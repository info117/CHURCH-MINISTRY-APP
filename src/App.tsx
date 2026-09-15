/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BibleTranslation,
  UserRole,
  SidebarTool,
  ChurchProfile,
  Sermon,
  BibleStudy,
  ChurchOperationEvent,
  WeeklyScheduleItem,
  PrayerRequest,
  Announcement,
  OrderOfServiceItem,
  ChurchMember,
  SyncState,
  UserAccount,
  PhysicalEquipment,
  EquipmentBooking,
  CelebrationAlert,
  ChurchSubscriptionState
} from './types';
import {
  initialSidebarTools,
  defaultChurchProfile,
  sampleSermons,
  sampleBibleStudies,
  sampleOperations,
  sampleWeeklySchedule,
  samplePrayerRequests,
  sampleAnnouncements,
  sampleOrderOfService,
  sampleMembers,
  sampleMedia,
  sampleEquipment,
  sampleEquipmentBookings
} from './data/initialData';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { ComputerVisionView } from './components/views/ComputerVisionView';
import { SermonsView } from './components/views/SermonsView';
import { DevotionalsView } from './components/views/DevotionalsView';
import { FaithGPTView } from './components/views/FaithGPTView';
import { OperationsView } from './components/views/OperationsView';
import { CalendarView } from './components/views/CalendarView';
import { MapsOutreachView } from './components/views/MapsOutreachView';
import { CongregationView } from './components/views/CongregationView';
import { FellowshipsView } from './components/views/FellowshipsView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { MultimediaView } from './components/views/MultimediaView';
import { LogosCorpusView } from './components/views/LogosCorpusView';
import { A2AJudgeLabView } from './components/views/A2AJudgeLabView';
import { ResourceManagementView } from './components/views/ResourceManagementView';
import { SubscriptionsBillingView } from './components/views/SubscriptionsBillingView';
import { SettingsView } from './components/views/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PrintModal } from './components/PrintModal';
import { AuthModal } from './components/AuthModal';
import { AppTour } from './components/AppTour';
import { churchAppTourSteps } from './data/tourSteps';
import { ThinkBibleAssistant } from './components/ThinkBibleAssistant';
import { performCloudSync } from './lib/syncService';
import {
  loadLocalSubscription,
  saveLocalSubscription,
  fetchSubscriptionFromFirestore
} from './lib/subscriptionService';
import { 
  subscribeToChurchPrayers, 
  savePrayerToFirestore, 
  updatePrayerStatusInFirestore, 
  updatePrayerUrgencyInFirestore,
  subscribeToChurchAnnouncements,
  saveAnnouncementToFirestore,
  subscribeToChurchMembers,
  saveMemberToFirestore,
  testFirestoreConnection,
  startHighUrgencyPrayerAlertBackgroundJob,
  getStoredPrayerEmailAlerts
} from './lib/firebase';
import { fcmService, PushNotificationPayload } from './lib/fcmService';
import { initializeChurchBrandTheme } from './lib/themeService';
import { startCelebrationWatcher } from './lib/celebrationWatcher';
import { PrayerEmailAlertModal } from './components/PrayerEmailAlertModal';
import { SimulatedPrayerEmailAlert } from './types';
import { Bell, X, CheckCircle2, Mail, ShieldAlert } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('church_app_theme');
    return (saved as any) || 'light';
  });

  // Global Bible Translation
  const [selectedTranslation, setSelectedTranslation] = useState<BibleTranslation>(() => {
    const saved = localStorage.getItem('church_app_bible_trans');
    return (saved as BibleTranslation) || 'KJV';
  });

  // User Role
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Super Administrator');

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string>('dashboard');

  // Sidebar tools reorderable state
  const [sidebarTools, setSidebarTools] = useState<SidebarTool[]>(() => {
    const saved = localStorage.getItem('church_sidebar_tools');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialSidebarTools;
  });

  // Domain data states
  const [churchProfile, setChurchProfile] = useState<ChurchProfile>(() => {
    const saved = localStorage.getItem('church_profile');
    return saved ? JSON.parse(saved) : defaultChurchProfile;
  });

  const [sermons, setSermons] = useState<Sermon[]>(sampleSermons);
  const [bibleStudies, setBibleStudies] = useState<BibleStudy[]>(sampleBibleStudies);
  const [operations, setOperations] = useState<ChurchOperationEvent[]>(sampleOperations);
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>(sampleWeeklySchedule);
  const [prayers, setPrayers] = useState<PrayerRequest[]>(samplePrayerRequests);
  const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements);
  const [orderOfService, setOrderOfService] = useState<OrderOfServiceItem[]>(sampleOrderOfService);
  const [members, setMembers] = useState<ChurchMember[]>(sampleMembers);
  const [equipment, setEquipment] = useState<PhysicalEquipment[]>(sampleEquipment);
  const [equipmentBookings, setEquipmentBookings] = useState<EquipmentBooking[]>(sampleEquipmentBookings);
  const [celebrationAlerts, setCelebrationAlerts] = useState<CelebrationAlert[]>([]);

  // Church SaaS Subscription & Billing State ($19.99/Monthly & $199.99/yearly)
  const [churchSubscription, setChurchSubscription] = useState<ChurchSubscriptionState>(() =>
    loadLocalSubscription()
  );

  // User Account & Authentication state (Firebase / Biometric)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('church_auth_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Sync State
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    lastSyncedAt: new Date().toISOString(),
    pendingChangesCount: 0,
    syncStatus: 'synced'
  });

  // Modals & Navigation cross-linking
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [printTargetSermon, setPrintTargetSermon] = useState<Sermon | undefined>(undefined);
  const [quickAiPrompt, setQuickAiPrompt] = useState<string>('');
  const [sermonScriptureFocus, setSermonScriptureFocus] = useState<string>('');
  const [sermonThemeFocus, setSermonThemeFocus] = useState<string>('');
  const [activePushToast, setActivePushToast] = useState<PushNotificationPayload | null>(null);

  // High-Urgency Prayer Email Alert States (Firebase Background Job)
  const [activeEmailAlertToast, setActiveEmailAlertToast] = useState<SimulatedPrayerEmailAlert | null>(null);
  const [selectedEmailAlertForModal, setSelectedEmailAlertForModal] = useState<SimulatedPrayerEmailAlert | null>(null);
  const [isEmailAlertModalOpen, setIsEmailAlertModalOpen] = useState<boolean>(false);
  const [allPrayerEmailAlerts, setAllPrayerEmailAlerts] = useState<SimulatedPrayerEmailAlert[]>(() => getStoredPrayerEmailAlerts());

  // Tour & ThinkBible states
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState<number>(0);
  const [isThinkBibleOpen, setIsThinkBibleOpen] = useState<boolean>(false);

  // Subscribe to real-time browser push alerts dispatched via FCM service
  useEffect(() => {
    const unsubscribe = fcmService.subscribe((payload) => {
      setActivePushToast(payload);
      // Auto dismiss toast after 7 seconds
      const timer = setTimeout(() => {
        setActivePushToast((current) => (current === payload ? null : current));
      }, 7000);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  // Initialize Firebase high-urgency prayer simulated email alert background job
  useEffect(() => {
    const stopPrayerAlertJob = startHighUrgencyPrayerAlertBackgroundJob((alert) => {
      setActiveEmailAlertToast(alert);
      setSelectedEmailAlertForModal(alert);
      setAllPrayerEmailAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)]);

      // Auto dismiss email alert toast after 9 seconds
      const timer = setTimeout(() => {
        setActiveEmailAlertToast(current => (current?.id === alert.id ? null : current));
      }, 9000);
      return () => clearTimeout(timer);
    });

    return () => {
      stopPrayerAlertJob();
    };
  }, []);

  // Firebase Firestore real-time synchronization listeners
  useEffect(() => {
    // 1. Check live Firestore connection
    testFirestoreConnection().then((connected) => {
      if (connected) {
        setSyncState(prev => ({
          ...prev,
          isOnline: true,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString()
        }));
      }
    });

    // 2. Real-time prayers synchronization
    const unsubPrayers = subscribeToChurchPrayers((livePrayers) => {
      if (livePrayers && livePrayers.length > 0) {
        setPrayers(livePrayers);
      }
    });

    // 3. Real-time announcements synchronization
    const unsubAnnouncements = subscribeToChurchAnnouncements((liveAnnouncements) => {
      if (liveAnnouncements && liveAnnouncements.length > 0) {
        setAnnouncements(liveAnnouncements);
      }
    });

    // 4. Real-time congregation members synchronization
    const unsubMembers = subscribeToChurchMembers((liveMembers) => {
      if (liveMembers && liveMembers.length > 0) {
        setMembers(liveMembers);
      }
    });

    // 5. Fetch persistent subscription from Firestore
    fetchSubscriptionFromFirestore().then((remoteSub) => {
      if (remoteSub && remoteSub.tierId) {
        setChurchSubscription((prev) => ({
          ...prev,
          ...remoteSub
        }));
      }
    });

    return () => {
      unsubPrayers();
      unsubAnnouncements();
      unsubMembers();
    };
  }, []);

  // Persist user account
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('church_auth_account', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('church_auth_account');
    }
  }, [currentUser]);

  // Handle Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('church_app_theme', theme);
  }, [theme]);

  // Handle Bible translation persist
  useEffect(() => {
    localStorage.setItem('church_app_bible_trans', selectedTranslation);
  }, [selectedTranslation]);

  // Apply custom church brand primary color dynamically to CSS root variables
  useEffect(() => {
    initializeChurchBrandTheme(churchProfile.customPrimaryColor || '#7D3AC1');
  }, [churchProfile.customPrimaryColor]);

  // Recurring background check cross-referencing member profiles for birthdays and anniversaries
  useEffect(() => {
    const cleanup = startCelebrationWatcher(
      () => members,
      (alerts) => {
        setCelebrationAlerts(alerts);
      },
      60000 // 1-minute recurring interval
    );
    return cleanup;
  }, [members]);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleReorderTools = (newTools: SidebarTool[]) => {
    setSidebarTools(newTools);
    localStorage.setItem('church_sidebar_tools', JSON.stringify(newTools));
  };

  const handleResetTools = () => {
    setSidebarTools(initialSidebarTools);
    localStorage.removeItem('church_sidebar_tools');
  };

  const handleTriggerSync = async () => {
    setSyncState(prev => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const result = await performCloudSync(churchProfile.churchName, {
        profile: churchProfile,
        sermons,
        bibleStudies,
        operations,
        schedule,
        prayers,
        announcements,
        members
      });
      setSyncState({
        isOnline: true,
        lastSyncedAt: result.timestamp,
        pendingChangesCount: 0,
        syncStatus: 'synced'
      });
    } catch {
      setSyncState(prev => ({
        ...prev,
        syncStatus: 'offline',
        pendingChangesCount: prev.pendingChangesCount + 1
      }));
    }
  };

  // Cross-Navigation helpers
  const handleQuickAiAsk = (prompt: string) => {
    setQuickAiPrompt(prompt);
    setActiveToolId('faithgpt');
  };

  const handleSendToSermonBuilder = (scripture: string, theme: string) => {
    setSermonScriptureFocus(scripture);
    setSermonThemeFocus(theme);
    setActiveToolId('sermons');
  };

  const handleCommitCvEvent = (event: ChurchOperationEvent) => {
    setOperations(prev => [event, ...prev]);
  };

  const handleAddAttendanceLog = (count: number, notes: string) => {
    // Add operation event or update
    const attendanceRecord: ChurchOperationEvent = {
      id: `att-${Date.now()}`,
      name: `Sanctuary Assembly Attendance (~${count} seated)`,
      type: 'Special Program',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      location: 'Main Sanctuary',
      speaker: 'Pastoral Team',
      leadMinistryTeam: 'Ushering & Media Board',
      estimatedBudget: 0,
      expectedAttendance: count,
      notes,
      status: 'Active'
    };
    setOperations(prev => [attendanceRecord, ...prev]);
  };

  const handlePrintSermon = (sermon: Sermon) => {
    setPrintTargetSermon(sermon);
    setIsPrintOpen(true);
  };

  const handlePrintBulletin = () => {
    setPrintTargetSermon(undefined);
    setIsPrintOpen(true);
  };

  return (
    <div
      id="church-ministry-app-root"
      className="min-h-screen flex bg-slate-100 dark:bg-[#040B18] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200"
    >
      {/* 1. Left-docked Single Panel Collapsible Sidebar */}
      <Sidebar
        tools={sidebarTools}
        activeToolId={activeToolId}
        onSelectTool={setActiveToolId}
        onReorderTools={handleReorderTools}
        onResetTools={handleResetTools}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        theme={theme}
        onOpenTour={() => {
          setIsTourOpen(true);
          setCurrentTourStepIndex(0);
        }}
        onOpenThinkBible={() => setIsThinkBibleOpen(true)}
      />

      {/* 2. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar
          appName={churchProfile.appName}
          churchName={churchProfile.churchName}
          logoUrl={churchProfile.logoUrl}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          selectedTranslation={selectedTranslation}
          onSelectTranslation={setSelectedTranslation}
          syncState={syncState}
          onTriggerSync={handleTriggerSync}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUserRole={currentUserRole}
          onSelectRole={setCurrentUserRole}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenPrint={handlePrintBulletin}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          activeToolId={activeToolId}
          onNavigateTo={setActiveToolId}
          onOpenTour={() => {
            setIsTourOpen(true);
            setCurrentTourStepIndex(0);
          }}
          onOpenThinkBible={() => setIsThinkBibleOpen(true)}
          churchSubscription={churchSubscription}
        />

        {/* Scrollable View Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeToolId === 'dashboard' && (
              <DashboardView
                churchProfile={churchProfile}
                sermons={sermons}
                operations={operations}
                schedule={schedule}
                prayers={prayers}
                selectedTranslation={selectedTranslation}
                celebrationAlerts={celebrationAlerts}
                members={members}
                onNavigateTo={setActiveToolId}
                onQuickAiAsk={handleQuickAiAsk}
                onSendToSermonBuilder={handleSendToSermonBuilder}
              />
            )}

            {activeToolId === 'computervision' && (
              <ComputerVisionView
                selectedTranslation={selectedTranslation}
                onCommitEvent={handleCommitCvEvent}
                onSendToSermonBuilder={handleSendToSermonBuilder}
                onAddAttendanceLog={handleAddAttendanceLog}
              />
            )}

            {activeToolId === 'sermons' && (
              <SermonsView
                sermons={sermons}
                bibleStudies={bibleStudies}
                onSaveSermon={(s) => {
                  setSermons(prev => {
                    const idx = prev.findIndex(item => item.id === s.id);
                    if (idx >= 0) {
                      const copy = [...prev];
                      copy[idx] = s;
                      return copy;
                    }
                    return [s, ...prev];
                  });
                }}
                onDeleteSermon={(id) => setSermons(prev => prev.filter(s => s.id !== id))}
                onSaveStudy={(st) => {
                  setBibleStudies(prev => {
                    const idx = prev.findIndex(item => item.id === st.id);
                    if (idx >= 0) {
                      const copy = [...prev];
                      copy[idx] = st;
                      return copy;
                    }
                    return [st, ...prev];
                  });
                }}
                onPrintSermon={handlePrintSermon}
                selectedTranslation={selectedTranslation}
                onSelectTranslation={setSelectedTranslation}
                initialScriptureFocus={sermonScriptureFocus}
                initialThemeFocus={sermonThemeFocus}
              />
            )}

            {activeToolId === 'devotionals' && (
              <DevotionalsView
                devotionals={[
                  {
                    id: 'dev-1',
                    title: 'Walking in Holiness and Kingdom Power',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    scriptureRef: '1 Peter 1:15-16',
                    scriptureText: 'As he which hath called you is holy, so be ye holy in all manner of conversation; Because it is written, Be ye holy; for I am holy.',
                    reflection: 'True spiritual authority in Christ does not come from eloquence or human exertion, but from deep separation unto God. Holiness is not merely the absence of transgression; it is the inward presence and rule of Christ.',
                    application: 'Set apart a sacred half-hour today for quiet meditation, asking the Holy Spirit to cleanse every motive.',
                    prayer: 'Gracious Father, baptize our hearts afresh in the beauty of Thy holiness. Let our speech and conduct reflect the purity of our Lord Jesus. Amen.',
                    author: 'Pastoral Council'
                  }
                ]}
                prayerRequests={prayers}
                onAddPrayerRequest={(req) => {
                  setPrayers(prev => [req, ...prev.filter(p => p.id !== req.id)]);
                }}
                onUpdatePrayerStatus={(id, status) => {
                  const target = prayers.find(p => p.id === id);
                  setPrayers(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
                  updatePrayerStatusInFirestore(id, status, target);
                }}
                onUpdatePrayerUrgency={(id, urgencyLevel) => {
                  const target = prayers.find(p => p.id === id);
                  setPrayers(prev => prev.map(p => (p.id === id ? { ...p, urgencyLevel } : p)));
                  updatePrayerUrgencyInFirestore(id, urgencyLevel, target);
                }}
                selectedTranslation={selectedTranslation}
              />
            )}

            {activeToolId === 'faithgpt' && (
              <FaithGPTView
                selectedTranslation={selectedTranslation}
                onSelectTranslation={setSelectedTranslation}
                onSendToSermonBuilder={handleSendToSermonBuilder}
                initialPrompt={quickAiPrompt}
              />
            )}

            {activeToolId === 'operations' && (
              <OperationsView
                operations={operations}
                onAddOperation={(op) => setOperations(prev => [op, ...prev])}
                onUpdateOperation={(op) =>
                  setOperations(prev => prev.map(o => (o.id === op.id ? op : o)))
                }
                onDeleteOperation={(id) => setOperations(prev => prev.filter(o => o.id !== id))}
                churchProfile={churchProfile}
                onOpenPrint={handlePrintBulletin}
              />
            )}

            {activeToolId === 'calendar' && (
              <CalendarView
                schedule={schedule}
                onAddScheduleItem={(item) => setSchedule(prev => [...prev, item])}
                onDeleteScheduleItem={(id) => setSchedule(prev => prev.filter(s => s.id !== id))}
              />
            )}

            {activeToolId === 'maps' && (
              <MapsOutreachView churchProfile={churchProfile} />
            )}

            {activeToolId === 'congregation' && (
              <CongregationView
                members={members}
                onAddMember={(m) => {
                  setMembers(prev => [m, ...prev]);
                  saveMemberToFirestore(m);
                }}
                currentUserRole={currentUserRole}
              />
            )}

            {activeToolId === 'fellowships' && (
              <FellowshipsView
                selectedTranslation={selectedTranslation}
                onNavigateToStudy={() => setActiveToolId('sermons')}
              />
            )}

            {activeToolId === 'announcements' && (
              <AnnouncementsView
                announcements={announcements}
                orderOfService={orderOfService}
                churchName={churchProfile.churchName}
                onPrintBulletin={handlePrintBulletin}
                onPublishAnnouncement={(ann) => {
                  setAnnouncements(prev => [ann, ...prev]);
                  saveAnnouncementToFirestore(ann);
                }}
              />
            )}

            {activeToolId === 'multimedia' && (
              <MultimediaView
                mediaList={sampleMedia}
                onSelectSermonToBuild={(t) => handleSendToSermonBuilder('Scripture Ref', t)}
              />
            )}

            {activeToolId === 'logos' && (
              <LogosCorpusView selectedTranslation={selectedTranslation} />
            )}

            {activeToolId === 'a2ajudge' && (
              <A2AJudgeLabView selectedTranslation={selectedTranslation} />
            )}

            {activeToolId === 'resources' && (
              <ResourceManagementView
                equipment={equipment}
                equipmentList={equipment}
                bookings={equipmentBookings}
                operations={operations}
                currentUserRole={currentUserRole}
                currentUserName={currentUser?.displayName || 'Rev. Dr. David Emmanuel'}
                onAddEquipment={(eq) => setEquipment(prev => [eq, ...prev])}
                onUpdateEquipment={(eq) => setEquipment(prev => prev.map(e => e.id === eq.id ? eq : e))}
                onDeleteEquipment={(id) => setEquipment(prev => prev.filter(e => e.id !== id))}
                onAddBooking={(booking) => setEquipmentBookings(prev => [booking, ...prev])}
                onUpdateBookingStatus={(id, status) => setEquipmentBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))}
                onDeleteBooking={(id) => setEquipmentBookings(prev => prev.filter(b => b.id !== id))}
              />
            )}

            {activeToolId === 'billing' && (
              <SubscriptionsBillingView
                subscription={churchSubscription}
                churchProfile={churchProfile}
                currentUser={currentUser}
                onUserChange={setCurrentUser}
                onUpdateSubscription={(newSub) => {
                  setChurchSubscription(newSub);
                  saveLocalSubscription(newSub);
                }}
                onNavigateToTool={setActiveToolId}
              />
            )}

            {activeToolId === 'settings' && (
              <SettingsView
                churchProfile={churchProfile}
                onUpdateProfile={(prof) => {
                  setChurchProfile(prof);
                  localStorage.setItem('church_profile', JSON.stringify(prof));
                }}
                onResetLayout={handleResetTools}
                members={members}
                sermons={sermons}
                operations={operations}
                schedule={schedule}
                announcements={announcements}
                prayers={prayers}
                onNavigateToBilling={() => setActiveToolId('billing')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sermons={sermons}
        operations={operations}
        members={members}
        onNavigateTo={setActiveToolId}
        selectedTranslation={selectedTranslation}
      />

      {/* Print Document Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        churchProfile={churchProfile}
        sermon={printTargetSermon}
      />

      {/* Google Sign-In & Biometric Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onRoleChange={setCurrentUserRole}
      />

      {/* Real-Time FCM Browser Push Toast */}
      {activePushToast && (
        <div
          id="fcm-push-notification-toast"
          role="alert"
          className="fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-[#0B1F4D] text-white border border-[#D4AF37]/60 shadow-2xl backdrop-blur-xl transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#D4AF37] text-[#0B1F4D] shrink-0 mt-0.5 shadow-md">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    FCM Push Broadcast
                  </span>
                  <span className="text-[10px] text-slate-300">Just Now</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">
                  {activePushToast.title}
                </h4>
                <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                  {activePushToast.body}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setActiveToolId('announcements');
                      setActivePushToast(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold transition-colors"
                  >
                    View Announcement
                  </button>
                  <button
                    onClick={() => setActivePushToast(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActivePushToast(null)}
              className="text-slate-400 hover:text-white p-1 transition-colors"
              aria-label="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* High-Urgency Prayer Simulated Email Alert Real-time Notification */}
      {activeEmailAlertToast && (
        <div
          id="prayer-email-alert-toast"
          role="alert"
          className="fixed top-20 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-[#18080C]/95 text-white border border-red-500/60 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 shadow-md">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
                    {activeEmailAlertToast.urgencyLevel} Prayer Alert
                  </span>
                  <span className="text-[10px] text-slate-300">Firebase Background Job</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1 line-clamp-1">
                  {activeEmailAlertToast.prayerTitle}
                </h4>
                <p className="text-xs text-red-100/80 mt-1 line-clamp-2">
                  Simulated email alert dispatched to pastoral intercessors for petition from {activeEmailAlertToast.requester}.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setSelectedEmailAlertForModal(activeEmailAlertToast);
                      setIsEmailAlertModalOpen(true);
                      setActiveEmailAlertToast(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>View Email Alert</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveToolId('devotionals');
                      setActiveEmailAlertToast(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Open Altar
                  </button>
                  <button
                    onClick={() => setActiveEmailAlertToast(null)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveEmailAlertToast(null)}
              className="text-slate-400 hover:text-white p-1 transition-colors"
              aria-label="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Simulated Email Inspection Modal */}
      <PrayerEmailAlertModal
        isOpen={isEmailAlertModalOpen}
        onClose={() => setIsEmailAlertModalOpen(false)}
        alert={selectedEmailAlertForModal}
        allAlerts={allPrayerEmailAlerts}
        onSelectAlert={(a) => setSelectedEmailAlertForModal(a)}
      />

      {/* Interactive App Feature Tour */}
      <AppTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        steps={churchAppTourSteps}
        currentStepIndex={currentTourStepIndex}
        onStepChange={setCurrentTourStepIndex}
        onNavigateToTool={(toolId) => setActiveToolId(toolId)}
        activeToolId={activeToolId}
      />

      {/* ThinkBible AI Assistant & Feature Guide */}
      <ThinkBibleAssistant
        isOpen={isThinkBibleOpen}
        onClose={() => setIsThinkBibleOpen(false)}
        onOpen={() => setIsThinkBibleOpen(true)}
        onStartTour={() => {
          setIsTourOpen(true);
          setCurrentTourStepIndex(0);
        }}
        onNavigateToTool={(toolId) => setActiveToolId(toolId)}
        activeToolId={activeToolId}
        selectedTranslation={selectedTranslation}
      />
    </div>
  );
}

