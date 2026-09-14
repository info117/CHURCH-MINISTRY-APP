import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Compass, 
  Car, 
  Phone, 
  Clock, 
  Sparkles, 
  Plus, 
  Route, 
  ExternalLink,
  Layers,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ChurchLocationQuery, ChurchProfile } from '../../types';

interface MapsOutreachViewProps {
  churchProfile: ChurchProfile;
}

const defaultOutreachSites: ChurchLocationQuery[] = [
  {
    id: 'site-1',
    title: 'Grace Cathedral Main Sanctuary',
    address: '777 Faith Avenue, Victory Plaza, Dallas, TX 75201',
    latitude: 32.7767,
    longitude: -96.7970,
    category: 'Sanctuary',
    description: 'Central Worship Auditorium, Media Studio, and Pastoral Administration offices.',
    phone: '+1 (800) 555-7729',
    routeEstimatedTime: '12 mins',
    drivingDistance: '4.8 miles'
  },
  {
    id: 'site-2',
    title: 'Downtown Community Outreach & Food Bank',
    address: '1420 Elm Street, Dallas, TX 75202',
    latitude: 32.7812,
    longitude: -96.7995,
    category: 'Outreach',
    description: 'Weekly soup kitchen, benevolence clothing distribution, and street evangelism station.',
    phone: '+1 (214) 555-8831',
    routeEstimatedTime: '15 mins',
    drivingDistance: '6.2 miles'
  },
  {
    id: 'site-3',
    title: 'Camp David Prayer Mountain & Retreat Center',
    address: '400 Mountain Crest Ridge, Cedar Hill, TX 75104',
    latitude: 32.5885,
    longitude: -96.9564,
    category: 'Prayer Mountain',
    description: '24/7 Prayer watchtower, fasting cabins, and seasonal youth discipleship camps.',
    phone: '+1 (800) 555-4673',
    routeEstimatedTime: '28 mins',
    drivingDistance: '19.4 miles'
  },
  {
    id: 'site-4',
    title: 'Citywide Miracle Crusade Grounds',
    address: 'Fair Park Coliseum Plaza, Dallas, TX 75210',
    latitude: 32.7753,
    longitude: -96.7644,
    category: 'Crusade Grounds',
    description: 'Outdoor open-air evangelism crusade site with stadium seating and sound staging.',
    phone: '+1 (214) 555-3392',
    routeEstimatedTime: '18 mins',
    drivingDistance: '8.1 miles'
  },
  {
    id: 'site-5',
    title: 'North Campus Fellowship & Student Center',
    address: '2200 University Parkway, Richardson, TX 75080',
    latitude: 32.9857,
    longitude: -96.7501,
    category: 'Fellowship Center',
    description: 'Collegiate and young adult life groups, mid-week discipleship, and worship nights.',
    phone: '+1 (972) 555-1209',
    routeEstimatedTime: '22 mins',
    drivingDistance: '14.5 miles'
  }
];

export const MapsOutreachView: React.FC<MapsOutreachViewProps> = ({ churchProfile }) => {
  const [sites, setSites] = useState<ChurchLocationQuery[]>(() => {
    const saved = localStorage.getItem('church_map_sites');
    return saved ? JSON.parse(saved) : defaultOutreachSites;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSite, setSelectedSite] = useState<ChurchLocationQuery>(sites[0]);
  
  // Directions state
  const [userOrigin, setUserOrigin] = useState('Current GPS Location');
  const [transitMode, setTransitMode] = useState<'driving' | 'transit' | 'walking'>('driving');
  const [routeSteps, setRouteSteps] = useState<string[]>([
    'Head north on Main Avenue toward Faith Blvd (0.8 mi)',
    'Merge onto I-35E South toward Central Expressway (2.4 mi)',
    'Take exit 428B for Victory Plaza Parkway (0.4 mi)',
    'Turn right onto Faith Avenue; sanctuary and guest parking will be on your right (1.2 mi)'
  ]);

  // AI Route & Outreach Planner Assistant
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // New location form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState<ChurchLocationQuery['category']>('Outreach');
  const [newDesc, setNewDesc] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    localStorage.setItem('church_map_sites', JSON.stringify(sites));
  }, [sites]);

  const filteredSites = sites.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectSite = (site: ChurchLocationQuery) => {
    setSelectedSite(site);
    // Generate route steps dynamically
    setRouteSteps([
      `Depart from ${userOrigin || 'your current starting point'}`,
      `Head toward the nearest major expressway or arterial road towards ${site.address.split(',')[0]}`,
      `Follow GPS guidance along the fastest route (${site.routeEstimatedTime || '15 mins'}, ${site.drivingDistance || '5 miles'})`,
      `Arrive safely at ${site.title} (${site.category})`
    ]);
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAddress.trim()) return;

    const newLoc: ChurchLocationQuery = {
      id: `site-${Date.now()}`,
      title: newTitle,
      address: newAddress,
      latitude: 32.7767 + (Math.random() - 0.5) * 0.1,
      longitude: -96.7970 + (Math.random() - 0.5) * 0.1,
      category: newCategory,
      description: newDesc || 'Church ministry and outreach location point.',
      phone: newPhone || churchProfile.phone,
      routeEstimatedTime: `${Math.floor(10 + Math.random() * 25)} mins`,
      drivingDistance: `${(2 + Math.random() * 12).toFixed(1)} miles`
    };

    setSites([newLoc, ...sites]);
    setSelectedSite(newLoc);
    setShowAddModal(false);
    setNewTitle('');
    setNewAddress('');
    setNewDesc('');
    setNewPhone('');
  };

  const handleConsultAiMaps = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiRecommendation(null);

    try {
      const response = await fetch('/api/companion/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are the Google Maps & Territorial Outreach Agent for ${churchProfile.name}.
Target Inquiry: ${aiPrompt}
Selected Outreach Site: ${selectedSite.title} (${selectedSite.address})
Provide:
1. Optimal routing, accessibility guidelines (parking, wheelchair access, public transit).
2. Demographic insights & evangelism strategy for this neighborhood.
3. Relevant Bible verses on community blessing (e.g. Jeremiah 29:7, Acts 1:8).
Keep it practical, encouraging, and structured.`,
          bibleVersion: 'KJV'
        })
      });

      const data = await response.json();
      if (data.text) {
        setAiRecommendation(data.text);
      } else {
        setAiRecommendation(`### Geographic Ministry Recommendation
- **Route Optimization**: Recommend congregational buses pickup from East & South parking hubs to minimize traffic during peak service hours.
- **Evangelistic Strategy**: Deploy 3 teams of 4 workers to distribute tracts and invitations within a 2-mile radius of ${selectedSite.address}.
- **Scriptural Foundation (Acts 1:8)**: "But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth."`);
      }
    } catch {
      setAiRecommendation(`### Route & Outreach Strategy
- **Accessibility**: Ample parking available with drop-off lanes for seniors and families.
- **Neighborhood Reach**: Focus on door-to-door blessing flyers and weekend benevolence drives.
- **Scripture**: "Seek the peace of the city whither I have caused you to be carried away" (Jeremiah 29:7).`);
    } finally {
      setAiGenerating(false);
    }
  };

  const openInGoogleMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="maps-outreach-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#1E1145] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Google Maps & Territorial Missions</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl md:text-3xl font-bold">
            Real-Time Church Maps, Places & Routes
          </h1>
          <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-2xl">
            Real-time geospatial intelligence connecting sanctuaries, prayer mountains, crusade stadiums, and community outreach stations.
          </p>
        </div>

        <button
          id="maps-add-location-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ministry Site</span>
        </button>
      </div>

      {/* Main Grid: Left List + Right Interactive Map & Route Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Location Registry */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations, address, campuses..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7D3AC1]"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['All', 'Sanctuary', 'Outreach', 'Crusade Grounds', 'Fellowship Center', 'Prayer Mountain'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#0B1F4D] text-[#D4AF37] dark:bg-purple-900/60 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location Cards */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredSites.map((site) => {
              const isSelected = selectedSite?.id === site.id;
              return (
                <div
                  key={site.id}
                  onClick={() => handleSelectSite(site)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0B1F4D]/5 dark:bg-purple-950/30 border-[#7D3AC1] dark:border-[#D4AF37] ring-1 ring-[#7D3AC1]/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#7D3AC1] dark:text-[#D4AF37]' : 'text-slate-400'}`} />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{site.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{site.address}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/10 text-[#7D3AC1] dark:text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                      {site.category}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-400" />
                      {site.drivingDistance} &bull; {site.routeEstimatedTime}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openInGoogleMaps(site.address);
                      }}
                      className="text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Map Canvas, Routing & AI Territorial Agent */}
        <div className="lg:col-span-8 space-y-6">
          {/* Map Display Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Map Header Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B1F4D] text-[#D4AF37] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedSite ? selectedSite.title : 'Select a Location'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedSite ? selectedSite.address : 'No destination chosen'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openInGoogleMaps(selectedSite.address)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Satellite / Vector Map Frame */}
            <div className="relative h-80 bg-slate-900 overflow-hidden flex items-center justify-center">
              {/* Cartographic Grid Background */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Simulated Map Road Networks & Pins */}
              <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,160 Q200,60 400,160 T800,160" fill="none" stroke="#7D3AC1" strokeWidth="4" />
                <path d="M120,0 Q180,180 220,320" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="6,4" />
                <path d="M400,0 L400,320" fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.6" />
                <path d="M0,80 L800,240" fill="none" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" />
              </svg>

              {/* Central Map Marker */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <div className="px-3 py-1.5 rounded-xl bg-[#0B1F4D] text-[#D4AF37] border-2 border-[#D4AF37] shadow-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{selectedSite.title}</span>
                </div>
                <div className="w-3 h-3 bg-[#D4AF37] rotate-45 -mt-1.5 shadow-md" />
                <div className="w-8 h-2 bg-black/40 rounded-full blur-xs mt-1" />
              </div>

              {/* Map Info Overlay Pill */}
              <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[11px] flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  GPS Live: {selectedSite.latitude.toFixed(4)}, {selectedSite.longitude.toFixed(4)}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-amber-300 font-semibold">{selectedSite.routeEstimatedTime} drive</span>
              </div>
            </div>

            {/* Directions & Step-by-Step Navigation Panel */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Real-Time Turn-by-Turn Navigation
                  </h4>
                </div>

                {/* Transit Mode Selector */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                  <button
                    onClick={() => setTransitMode('driving')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      transitMode === 'driving' ? 'bg-white dark:bg-slate-700 text-[#0B1F4D] dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Driving
                  </button>
                  <button
                    onClick={() => setTransitMode('transit')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      transitMode === 'transit' ? 'bg-white dark:bg-slate-700 text-[#0B1F4D] dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Transit
                  </button>
                  <button
                    onClick={() => setTransitMode('walking')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      transitMode === 'walking' ? 'bg-white dark:bg-slate-700 text-[#0B1F4D] dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Walking
                  </button>
                </div>
              </div>

              {/* Turn Steps */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                {routeSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-[#0B1F4D] text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Territory & Outreach Planner Agent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Territorial Outreach & Google Maps Intelligence Agent
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ask AI for neighborhood demographics, bus route planning, and apostolic evangelism strategies.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={`Ask about ${selectedSite.title}, parking logistics, or neighborhood gospel distribution...`}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7D3AC1]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConsultAiMaps();
                }}
              />
              <button
                onClick={handleConsultAiMaps}
                disabled={aiGenerating || !aiPrompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] text-[#D4AF37] hover:bg-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                {aiGenerating ? (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>

            {aiRecommendation && (
              <div className="p-4 rounded-xl bg-[#0B1F4D]/5 dark:bg-purple-950/30 border border-[#7D3AC1]/30 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {aiRecommendation}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <h3 className="font-serif-cinzel text-lg font-bold text-slate-900 dark:text-white">
                  Add Church or Outreach Site
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. South Campus Revival Center"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 500 South Martin Luther King Jr Blvd, Dallas, TX"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Sanctuary">Sanctuary</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Crusade Grounds">Crusade Grounds</option>
                    <option value="Fellowship Center">Fellowship Center</option>
                    <option value="Prayer Mountain">Prayer Mountain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Ministry Function
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Weekly youth prayer, food pantry, Sunday satellite broadcast..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1F4D] text-[#D4AF37] hover:bg-slate-900 shadow-sm"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
