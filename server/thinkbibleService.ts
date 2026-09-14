import { GoogleGenAI } from '@google/genai';
import { callGeminiWithResilience } from './geminiResilience';

export interface ThinkBibleRequest {
  prompt: string;
  activeToolId?: string;
  bibleVersion?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface ThinkBibleResult {
  success: boolean;
  provider: string;
  text: string;
  suggestedActions: { label: string; toolId?: string; action?: string }[];
}

/**
 * Extracts ACTION:[toolId]:[Label] tags from response text
 */
export function extractSuggestedActions(rawText: string): {
  cleanText: string;
  actions: { label: string; toolId?: string; action?: string }[];
} {
  const actions: { label: string; toolId?: string; action?: string }[] = [];
  const actionRegex = /ACTION:([a-zA-Z0-9_-]+):([^\n\r]+)/g;

  let match;
  while ((match = actionRegex.exec(rawText)) !== null) {
    const target = match[1].trim();
    const label = match[2].trim();
    if (target === 'tour' || target === 'start-tour') {
      actions.push({ label, action: 'start-tour' });
    } else {
      actions.push({ label, toolId: target });
    }
  }

  const cleanText = rawText.replace(/ACTION:[a-zA-Z0-9_-]+:[^\n\r]+/g, '').trim();
  return { cleanText, actions };
}

/**
 * Deterministic, context-rich fallback response generator for ThinkBible
 */
export function generateThinkBibleFallback(
  prompt: string,
  activeToolId: string = 'dashboard',
  bibleVersion: string = 'KJV'
): { text: string; suggestedActions: { label: string; toolId?: string; action?: string }[] } {
  const p = prompt.toLowerCase();

  // 1. Tour / Walkthrough / Getting Started
  if (p.includes('tour') || p.includes('walkthrough') || p.includes('guide') || p.includes('start') || p.includes('get started') || p.includes('how to use')) {
    const raw = `Greetings in Christ! I am **ThinkBible**, your dedicated AI Assistant and guide for **CHURCH MINISTRY APP**.

Our digital platform is tailored to empower church pastors, elders, and ministry administrators with modern tools rooted in orthodox biblical excellence.

### How to Navigate the Platform:
- **Interactive Tour**: You can launch our step-by-step walkthrough at any time to see each module with live preview transitions.
- **Quick Keyboard Shortcut**: Press **⌘K** (or **Ctrl+K**) on any screen to open the global search palette.
- **Voice Commands**: Tap the microphone icon in the top navigation bar to navigate hands-free.
- **Scripture Translation**: Switch between KJV, NASB, NIV, and NLT in the top bar anytime.

Would you like me to start the interactive guided tour for you now?

ACTION:tour:Start Interactive App Tour
ACTION:dashboard:Open Ministry Dashboard`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 2. Computer Vision / Seating / Attendance count / Camera / OCR
  if (p.includes('vision') || p.includes('camera') || p.includes('seat') || p.includes('attendance') || p.includes('pew') || p.includes('ocr') || p.includes('flyer')) {
    const raw = `### Computer Vision & Sanctuary Seating Intelligence

The **Computer Vision** module empowers your ushering and media teams with automated visual analytics:

1. **Crowd & Seating Density**: Upload or capture a photograph of your sanctuary during service. The vision pipeline calculates estimated congregation headcount and percentage capacity filled.
2. **Sanctuary Geometry Detection**: Identifies the pulpit, altar rail, choir loft, and center aisles to verify traffic flow and safety.
3. **Event Flyer OCR**: Upload church event flyers, conference banners, or bulletins to extract titles, dates, guest speakers, and scripture references directly into your calendar.
4. **Privacy-Preserving**: Crowd estimates are computed anonymously without storing facial biometric identities.

Would you like to try it now with a sample sanctuary image or your own photo?

ACTION:computervision:Open Computer Vision Seating Analyzer
ACTION:dashboard:Return to Dashboard`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 3. Expository Sermon Builder / Preaching / Manuscripts / Outlines
  if (p.includes('sermon') || p.includes('preach') || p.includes('homiletic') || p.includes('outline') || p.includes('manuscript') || p.includes('exegesis')) {
    const raw = `### Expository Sermon Builder

The **Expository Sermon Builder** equips preachers to build Christ-centered, exegetically sound sermons:

1. **3-Point Homiletic Framework**: Generates structured outlines comprising Introduction, Historical Setting, Expository Main Points, Practical Illustrations, Pastoral Applications, and an Altar Call.
2. **Commentary Integration**: Draws wisdom from classic orthodox commentaries including Charles Spurgeon, Matthew Henry, and John Wesley.
3. **Pulpit Ready Manuscripts**: Write and refine complete sermon drafts, insert scripture cross-references in ${bibleVersion}, and format for print or tablet pulpit display.
4. **One-Click Export**: Print directly or export a PDF manuscript using the print button in the top bar.

You can also send verses directly from FaithGPT or Computer Vision into the builder.

ACTION:sermons:Open Expository Sermon Builder
ACTION:faithgpt:Research Scripture with FaithGPT`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 4. Devotionals & Real-Time Prayer Requests / Firestore
  if (p.includes('prayer') || p.includes('devotional') || p.includes('intercession') || p.includes('urgency') || p.includes('petition')) {
    const raw = `### Devotionals & Real-Time Prayer Wall

The **Devotionals & Prayer Requests** module sustains the spiritual heartbeat of your ministry:

1. **Persistent Cloud Prayer Wall**: Powered by **Google Cloud Firestore**, prayer requests synchronize live across all pastoral staff devices.
2. **Urgency Classification**: Filter petitions by **Urgent** (critical medical emergencies, bereavement) and **General** (thanksgiving, travel mercies, guidance).
3. **Status Life-cycle**: Transition requests from *Active* -> *In Prayer* -> *Answered*. Marking requests as Answered builds a living praise wall of God's faithfulness!
4. **Daily Devotionals**: Provides structured daily scripture reading, theological reflection, personal application, and pastoral prayers.

ACTION:devotionals:View Real-time Prayer Wall
ACTION:settings:Check Firestore Cloud Sync`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 5. Equipment & Operations / Resource Management
  if (p.includes('equipment') || p.includes('resource') || p.includes('soundboard') || p.includes('inventory') || p.includes('projector') || p.includes('operation')) {
    const raw = `### Church Operations & Sanctuary Equipment Tracking

The **Operations & Equipment Management** modules handle logistics with stewardship:

1. **Physical Asset Tracking**: Maintain a barcode and serial-numbered inventory of church soundboards, wireless lapels, video projectors, communion sets, and baptismal supplies.
2. **Departmental Checkout & Bookings**: Ministry teams (Youth, Worship, Media) can reserve gear in advance, preventing Sunday morning scheduling conflicts.
3. **Condition & Maintenance Audits**: Flag items as *Excellent*, *Good*, or *Needs Repair* with scheduled maintenance tracking.
4. **Service Operations**: Coordinate Sunday liturgies, rehearsal slots, and special conference itineraries with budget tracking.

ACTION:resources:Open Equipment & Inventory
ACTION:operations:View Church Operations Calendar`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 6. Congregation Directory & Celebration Watcher
  if (p.includes('member') || p.includes('congregation') || p.includes('birthday') || p.includes('anniversary') || p.includes('flock') || p.includes('celebration')) {
    const raw = `### Congregation Directory & Automated Celebration Watcher

The **Congregation** view keeps pastoral staff closely connected to the flock:

1. **Searchable Member Roster**: Filter by fellowship group (*Men's Fellowship*, *Women of Grace*, *Youth & Campus*, *Children's Ministry*), role, and contact information.
2. **Automated Celebration Watcher**: A continuous background service cross-references member records and displays golden banner alerts for today's birthdays and wedding anniversaries.
3. **Pastoral Communication**: Click on any celebration banner to instantly generate an email or SMS blessing message.
4. **Attendance & Follow-up**: Track member attendance health to prioritize pastoral visitation for members missing services.

ACTION:congregation:Open Congregation Directory
ACTION:dashboard:View Dashboard Alerts`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 7. Bulletins, Order of Service & Push Alerts
  if (p.includes('bulletin') || p.includes('announcement') || p.includes('push') || p.includes('fcm') || p.includes('print bulletin') || p.includes('order of service')) {
    const raw = `### Bulletins, Announcements & Push Alerts

The **Announcements** module powers multi-channel church communications:

1. **Sunday Bulletin Builder**: Formulate church notices categorized by *General*, *Youth*, *Missions*, or *Administration*.
2. **Order of Service Sequence**: Configure the exact Sunday liturgy order (Call to Worship, Opening Hymn, Tithes, Pastoral Prayer, Scripture Reading, Sermon, Benediction).
3. **Dual-Column Print Layout**: Click the print action to generate a traditional folded or two-column church bulletin for distribution to attendees.
4. **Browser Push Alerts**: Dispatches real-time pop-up push alerts via the integrated FCM service.

ACTION:announcements:Open Bulletin & Announcements
ACTION:calendar:View Service Schedule`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 8. Logos Corpus & Original Languages (Hebrew / Greek)
  if (p.includes('logos') || p.includes('greek') || p.includes('hebrew') || p.includes('corpus') || p.includes('strong') || p.includes('lexicon')) {
    const raw = `### Logos Corpus & Original Biblical Languages

The **Logos Corpus** view provides deep biblical language study:

1. **Interlinear Scripture Inspection**: Read Hebrew Old Testament and Greek New Testament texts side-by-side with your chosen English translation (${bibleVersion}).
2. **Strong's Exhaustive Concordance**: Click or hover over words to view lemma numbers, transliterations, root derivations, and lexical meanings.
3. **Theological Dictionaries**: Explores doctrinal nuances (e.g. *agape*, *chesed*, *shalom*, *hagios*) to enrich your preaching and teaching.

ACTION:logos:Explore Logos Corpus
ACTION:faithgpt:Consult FaithGPT on Scripture`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 9. A2A Multi-Agent & Judge Lab
  if (p.includes('a2a') || p.includes('judge') || p.includes('agent') || p.includes('pipeline') || p.includes('soundness')) {
    const raw = `### A2A Multi-Agent Collaboration & Theological Judge Lab

The **A2A Judge Lab** demonstrates agentic AI with rigorous ecclesiastical safeguards:

1. **Agent-to-Agent Pipeline**: A specialized *MinistryBuilder Agent* drafts expository sermon outlines, Bible study notes, and conference themes.
2. **Theological Judge Agent**: Automatically audits every generated draft against historic orthodox Christian doctrine.
3. **Theological Soundness Score**: Provides an objective 0-100% soundness rating, auditing scripture quotes against ${bibleVersion}, flagging potential speculative errors, and ensuring biblical fidelity.
4. **Audit Log**: View transparent agent-to-agent deliberations before final pastoral approval.

ACTION:a2ajudge:Launch A2A Judge Lab
ACTION:sermons:Open Sermon Builder`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 10. Subscriptions & Ministry Billing ($19.99/Monthly & $199.99/yearly)
  if (p.includes('subscri') || p.includes('bill') || p.includes('price') || p.includes('cost') || p.includes('plan') || p.includes('rate') || p.includes('19.99') || p.includes('199.99') || p.includes('tier')) {
    const raw = `### Subscriptions & Ministry Billing Plans
    
**CHURCH MINISTRY APP** offers transparent, steward-friendly pricing for churches and ministries:

- **Sanctuary Pro**:
  - **$19.99/Monthly** — Flexible month-to-month subscription.
  - **$199.99/yearly** — Annual stewardship savings (~17% discount / 2 complimentary months).
  - *Features Included*: Unlimited AI Expository Sermon Studio, Computer Vision Sanctuary Seating & OCR, real-time Google Cloud Firestore sync, member celebration watcher, and priority pastoral tech support.

- **Ministry Starter ($0/mo)**: Free foundational tools for church plants and small house fellowships (up to 50 members).
- **Cathedral Enterprise ($49.99/mo or $499.99/yr)**: Multi-campus sanctuary routing and custom white-label branding.

All ministry plans include **501(c)(3) tax-exempt verification** (0% sales tax) and downloadable PDF receipts for church finance boards.

ACTION:billing:Open Subscriptions & Billing
ACTION:dashboard:Return to Dashboard`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 11. Firebase / Cloud Sync / Settings / Backup
  if (p.includes('firebase') || p.includes('firestore') || p.includes('sync') || p.includes('backup') || p.includes('cloud') || p.includes('setting') || p.includes('theme') || p.includes('brand')) {
    const raw = `### Firebase Firestore Cloud Sync & Church Customization

The **Settings** module handles enterprise configuration and security:

1. **Live Google Cloud Firestore Connection**: Displays database status (\`ai-studio-churchministryap-02458b6b-f450-48a1-9e1f-5cd9fbd96a26\`), active sync listeners, and on-demand connection verification.
2. **Real-time Synchronization**: Prayers, announcements, and congregation data sync bidirectionally in real-time.
3. **Custom Liturgical Branding**: Generate a complete palette based on your church's primary brand color (e.g., Royal Marian Purple, Sanctuary Navy, Golden Amber) or extract it directly from your uploaded church logo.
4. **AES-256 Cloud & Local Archival**: Create encrypted snapshots on cloud storage or download an immediate JSON archive to your device for offline records.

ACTION:settings:Open Settings & Firebase Sync
ACTION:dashboard:Return to Dashboard`;
    const { cleanText, actions } = extractSuggestedActions(raw);
    return { text: cleanText, suggestedActions: actions };
  }

  // 11. General Biblical or Feature Guidance
  const raw = `### Greetings! I am ThinkBible, your Ministry AI Companion

I am here to assist your pastoral team with any questions about **CHURCH MINISTRY APP** and your biblical study workflows.

### What would you like to explore today?
- **Computer Vision**: Analyze sanctuary attendance and crowd density from photos.
- **Expository Preaching**: Build structured 3-point homiletic outlines with commentary notes.
- **Prayer Wall**: Manage real-time prayer requests synchronized with Google Cloud Firestore.
- **Physical Equipment**: Book microphones, soundboards, and track inventory.
- **Celebration Watcher**: View upcoming birthdays and wedding anniversaries among members.
- **Guided Tour**: Let me walk you through the entire application step-by-step!

Feel free to ask any question about app features or scripture study!

ACTION:tour:Start Interactive App Tour
ACTION:sermons:Open Sermon Builder
ACTION:computervision:Open Computer Vision`;
  const { cleanText, actions } = extractSuggestedActions(raw);
  return { text: cleanText, suggestedActions: actions };
}

/**
 * Main handler for ThinkBible AI Assistant
 */
export async function handleThinkBibleQuery(
  ai: GoogleGenAI | null,
  body: ThinkBibleRequest
): Promise<ThinkBibleResult> {
  const { prompt, activeToolId = 'dashboard', bibleVersion = 'KJV', history = [] } = body;

  if (ai) {
    try {
      const systemInstruction = `You are ThinkBible, the intelligent AI Assistant and Interactive Guide for CHURCH MINISTRY APP.
Your mission is to clearly, warmly, and authoritatively explain all features of the church application, assist pastors and church administrators in using every tool, provide orthodox biblical context, and guide users step-by-step through their ministry workflows.

Here is your complete guide to the modules of CHURCH MINISTRY APP:
1. Executive Dashboard (id: 'dashboard'):
   - Live attendance KPIs vs prior week, service schedule, prayer wall summary, quick action cards.
2. Computer Vision Seating & Media OCR (id: 'computervision'):
   - Upload sanctuary photos or video snapshots to calculate congregation crowd count, seating density %, altar/pulpit layout detection, and OCR extraction of flyers to create calendar events.
3. Expository Sermon Builder (id: 'sermons'):
   - Homiletic manuscript generator, 3-point expository outlines, historical commentary integration (Spurgeon, Matthew Henry), sermon illustrations, and export to PDF/Print.
4. Daily Devotionals & Real-time Prayer Requests (id: 'devotionals'):
   - Daily scripture reflections, pastoral prayers, and a persistent live prayer wall backed by Google Cloud Firestore with Urgent vs General urgency badges.
5. FaithGPT Theological Companion (id: 'faithgpt'):
   - Orthodox theological research engine answering deep doctrinal inquiries with multi-translation scripture comparative views (KJV, NASB, NIV, NLT).
6. Operations & Physical Church Equipment Inventory (id: 'operations' and 'resources'):
   - Physical equipment barcode/serial inventory tracking (soundboards, projectors, communion sets), departmental checkout reservations, and facility maintenance workflows.
7. Service Calendar & Schedule (id: 'calendar'):
   - Weekly liturgy, order of service times, rehearsal slots, and minister duty rotations.
8. Maps & Outreach Demographics (id: 'maps'):
   - Interactive outreach mapping showing community zones, bus pickup routes, and demographic heatmaps.
9. Congregation & Celebration Watcher (id: 'congregation'):
   - Flock directory with contact info, fellowship group affiliation, and a background watcher that automatically detects upcoming birthdays and wedding anniversaries with celebratory SMS/email drafts.
10. Bulletins & Multi-Channel Announcements (id: 'announcements'):
    - Digital Sunday bulletin builder, order of service layout, print preview with dual-column church format, and browser/FCM push notifications.
11. Logos Corpus & Original Biblical Languages (id: 'logos'):
    - Interlinear Hebrew (Old Testament) and Greek (New Testament) morphology, Strong's concordance numbers, and cross-references.
12. A2A Multi-Agent Judge Lab (id: 'a2ajudge'):
    - Multi-agent collaboration where specialized agents generate content audited by a strict theological Judge Agent scoring orthodoxy and verifying scripture citations.
13. Settings & Firebase Firestore Cloud Sync (id: 'settings'):
    - Church profile customizer, custom ecclesiastical primary color branding generator, Firebase Firestore connection monitor, and AES-256 encrypted cloud backup exports.
14. Subscriptions & Billing Center (id: 'billing'):
    - Transparent ministry plans: Sanctuary Pro at **$19.99/Monthly** and **$199.99/yearly** (Save ~17% / 2 months complimentary stewardship).
    - Features: Unlimited AI Sermon Studio, Computer Vision seating analyzer, real-time Firestore multi-device sync, 501(c)(3) tax-exempt status verification (0% tax), and downloadable official receipts.
15. Global Shortcuts & Voice Control:
    - ⌘K or Ctrl+K opens global omni-search.
    - Web Speech API voice listener in the top bar allows hands-free voice commands.
    - Top bar Print button generates print-ready bulletins or sermon manuscripts.
16. Interactive App Tour:
    - Guided step-by-step walkthrough covering the entire application with live view transitions.

Instructions:
- Speak warmly with pastoral clarity, theological reverence, and practical helpfulness.
- When explaining a feature, give direct instructions on where to find it and how to use it.
- Always include 1-3 actionable navigation buttons at the very bottom of your answer, formatted strictly on separate lines as:
  ACTION:[toolId]:[Button Label]
  Examples:
  ACTION:billing:Open Subscriptions & Billing
  ACTION:computervision:Open Computer Vision Seating Analyzer
  ACTION:sermons:Go to Sermon Builder
  ACTION:tour:Start Guided App Tour
  ACTION:devotionals:View Real-time Prayers
  ACTION:settings:Open Settings & Sync`;

      // Build conversation contents including history
      const formattedHistory = history.slice(-6).map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      const currentContent = {
        role: 'user',
        parts: [
          {
            text: `Current Active View: ${activeToolId}\nSelected Bible Translation: ${bibleVersion}\n\nUser Question: ${prompt}`
          }
        ]
      };

      const aiResult = await callGeminiWithResilience(ai, {
        primaryModel: 'gemini-3.8-flash',
        fallbackModels: ['gemini-flash-latest', 'gemini-3.1-flash-lite'],
        contents: [...formattedHistory, currentContent] as any,
        config: {
          systemInstruction
        }
      });

      if (aiResult.success && aiResult.text) {
        const { cleanText, actions } = extractSuggestedActions(aiResult.text);
        return {
          success: true,
          provider: aiResult.modelUsed || 'gemini',
          text: cleanText,
          suggestedActions: actions.length > 0 ? actions : [
            { label: 'Start Interactive App Tour', action: 'start-tour' },
            { label: 'Open Ministry Dashboard', toolId: 'dashboard' }
          ]
        };
      }
    } catch (err) {
      console.warn('ThinkBible Gemini call failed, falling back to local engine:', err);
    }
  }

  // Resilient local engine fallback
  const fallback = generateThinkBibleFallback(prompt, activeToolId, bibleVersion);
  return {
    success: true,
    provider: 'thinkbible-built-in-engine',
    text: fallback.text,
    suggestedActions: fallback.suggestedActions
  };
}
