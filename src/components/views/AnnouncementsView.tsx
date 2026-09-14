import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Printer,
  Bell,
  Smartphone,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  Plus,
  ShieldCheck,
  Send,
  AlertTriangle,
  Radio,
  Wifi
} from 'lucide-react';
import { Announcement, OrderOfServiceItem } from '../../types';
import { fcmService, PushNotificationPayload } from '../../lib/fcmService';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  orderOfService: OrderOfServiceItem[];
  churchName: string;
  onPrintBulletin: () => void;
  onPublishAnnouncement: (announcement: Announcement) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  orderOfService,
  churchName,
  onPrintBulletin,
  onPublishAnnouncement
}) => {
  const [activeTab, setActiveTab] = useState<'bulletin' | 'notifications'>('bulletin');
  const [pushTitle, setPushTitle] = useState('Sanctuary Vigil Reminder');
  const [pushBody, setPushBody] = useState('Tonight at 10:00 PM: The Great Altar of Power. Come fasting and praying.');
  const [pushPriority, setPushPriority] = useState<'Standard' | 'High' | 'Emergency'>('High');
  const [pushSentNotice, setPushSentNotice] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'General' | 'Urgent' | 'Event' | 'Fellowship'>('General');
  const [newPriority, setNewPriority] = useState<'Standard' | 'High' | 'Emergency'>('High');
  const [newAuthor, setNewAuthor] = useState('Pastoral Council');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Push Permission State
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [fcmEnabled, setFcmEnabled] = useState(true);

  useEffect(() => {
    setPermissionStatus(fcmService.getPermissionStatus());
    fcmService.initializeFCM().catch(() => {});
  }, []);

  const handleRequestPushPermission = async () => {
    const perm = await fcmService.requestPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      setPushSentNotice('Browser push notifications enabled via Firebase Cloud Messaging!');
      setTimeout(() => setPushSentNotice(null), 3500);
    }
  };

  const handleSimulatePush = async (e: React.FormEvent) => {
    e.preventDefault();
    const testAnn: Announcement = {
      id: `push-test-${Date.now()}`,
      title: pushTitle,
      date: new Date().toISOString().split('T')[0],
      category: 'General',
      content: pushBody,
      priority: pushPriority,
      author: 'Church Administration'
    };

    const res = await fcmService.triggerAnnouncementNotification(testAnn);
    setPushSentNotice(
      res.browserNotificationSent
        ? 'Native browser push notification successfully triggered and displayed!'
        : 'In-app notification broadcasted. (Enable browser permissions to see system banners).'
    );
    setTimeout(() => setPushSentNotice(null), 4000);
  };

  // When an administrator publishes an announcement, automatically trigger browser-based push notifications via FCM
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPublishing(true);

    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      content: newContent.trim(),
      priority: newPriority,
      author: newAuthor.trim() || 'Church Administration'
    };

    // 1. Notify parent state
    onPublishAnnouncement(ann);

    // 2. Trigger browser-based push notification using Firebase Cloud Messaging
    let notifSent = false;
    if (fcmEnabled) {
      const fcmResult = await fcmService.triggerAnnouncementNotification(ann);
      notifSent = fcmResult.browserNotificationSent;
    }

    setIsPublishing(false);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');

    setPushSentNotice(
      notifSent
        ? `Announcement published & native browser push notification triggered for congregation!`
        : `Announcement published & synchronized to Firestore backend.`
    );
    setTimeout(() => setPushSentNotice(null), 4500);
  };

  return (
    <div id="announcements-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A1550] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Megaphone className="w-4 h-4" />
            <span>Church Communications & Bulletin</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Church Bulletin & Mobile Notifications
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Publish weekly orders of service, distribute official notices, and dispatch browser push notifications via Firebase Cloud Messaging.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Push permission pill */}
          {permissionStatus === 'granted' ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>FCM Push Active</span>
            </div>
          ) : (
            <button
              onClick={handleRequestPushPermission}
              className="px-3 py-1.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Enable Browser Push</span>
            </button>
          )}

          <button
            onClick={onPrintBulletin}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Print Bulletin</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {/* Push Dispatch Alert Notification Toast */}
      {pushSentNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-semibold">{pushSentNotice}</span>
          </div>
          <button onClick={() => setPushSentNotice(null)} className="text-xs font-bold text-emerald-700">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('bulletin')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'bulletin'
              ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Order of Service & Bulletin
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>FCM Push Notification Dispatch</span>
        </button>
      </div>

      {activeTab === 'bulletin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Order of Divine Worship */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Order of Divine Worship
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">Sunday Service</span>
              </div>

              <div className="space-y-2.5">
                {orderOfService.map((item) => (
                  <div
                    key={item.sequence}
                    className="p-3 rounded-xl border border-slate-200 dark:border-indigo-950/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#0B1F4D] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0">
                        {item.sequence}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.activity}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.assignedLeader} {item.notes ? `&bull; ${item.notes}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#7D3AC1] dark:text-[#D4AF37] font-mono shrink-0">
                      {item.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Official Ministry Announcements
                  </h3>
                </div>
                <span className="text-xs text-slate-500">{announcements.length} Notices</span>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {ann.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        {ann.priority === 'Emergency' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            Emergency
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-purple-300">
                          {ann.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>Posted by {ann.author}</span>
                      <span>{ann.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Push Notification Dispatch Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  <span>Dispatch Push Notification via FCM</span>
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>FCM Web Gateway Online</span>
                </div>
              </div>

              <form onSubmit={handleSimulatePush} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                    <select
                      value={pushPriority}
                      onChange={(e) => setPushPriority(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <option value="Standard">Standard Notice</option>
                      <option value="High">High Urgency</option>
                      <option value="Emergency">Emergency Sanctuary Alert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Browser Native Push</label>
                    <div className="pt-2 text-xs flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-600 uppercase text-[11px]">{permissionStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message Body</label>
                  <textarea
                    required
                    rows={3}
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Firebase Cloud Messaging Pipeline: Web, iOS & Android
                  </span>
                  <p className="text-[11px] opacity-80">
                    Triggers native desktop/mobile push banners, plays sanctuary chime, and persists notice into Firestore backend.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#7D3AC1] hover:bg-[#6023A1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Test Browser Push Dispatch</span>
                  </button>

                  {permissionStatus !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPushPermission}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      Request Browser Permissions
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Live Mobile Screen Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-72 rounded-3xl border-4 border-slate-800 bg-slate-950 p-4 shadow-2xl text-white space-y-4">
              <div className="h-4 w-28 bg-slate-800 rounded-full mx-auto" />
              <div className="text-center text-[10px] text-slate-400">Lock Screen Preview</div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] text-[#D4AF37]">
                  <span className="font-bold uppercase tracking-wider">{churchName}</span>
                  <span className="text-slate-400">now</span>
                </div>
                <div className="font-bold text-xs text-white leading-tight">
                  {pushTitle || 'Announcement Title'}
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-3">
                  {pushBody || 'Notification body text will render here.'}
                </div>
              </div>

              <div className="text-center pt-12 text-[10px] text-slate-500">
                Swipe up to open Church Ministry App
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white">
                Publish Ministry Announcement
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notice Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Workers' Vigil & Consecration"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="General">General</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Event">Event</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Standard">Standard</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Author / Ministry Board</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Pastoral Administration"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notice Body</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Details of the announcement..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* FCM Push Notification Trigger toggle */}
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#7D3AC1] dark:text-purple-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>FCM Push Notification Dispatch</span>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Triggers browser push notification to congregation upon publish
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={fcmEnabled}
                  onChange={(e) => setFcmEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7D3AC1] focus:ring-[#7D3AC1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishing ? 'Broadcasting Notice...' : 'Publish & Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

