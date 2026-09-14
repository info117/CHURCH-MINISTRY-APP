import React, { useState } from 'react';
import {
  Video,
  Play,
  Pause,
  Volume2,
  Download,
  Share2,
  Clock,
  Radio,
  Sparkles,
  FileText,
  Music
} from 'lucide-react';
import { MediaResource } from '../../types';

interface MultimediaViewProps {
  mediaList: MediaResource[];
  onSelectSermonToBuild?: (title: string) => void;
}

export const MultimediaView: React.FC<MultimediaViewProps> = ({
  mediaList,
  onSelectSermonToBuild
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaResource>(mediaList[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('All');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(false);

  const filtered = filterType === 'All'
    ? mediaList
    : mediaList.filter(m => m.type === filterType);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div id="multimedia-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A1550] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Video className="w-4 h-4" />
            <span>Digital Sanctuary &bull; Media Archive</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Multimedia & Sermon Audio Library
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Stream high-fidelity sermons, worship sessions, video studies, and download pulpit slide decks.
          </p>
        </div>

        <button
          onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0 ${
            isLiveStreamActive
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{isLiveStreamActive ? 'Live Stream On Air' : 'Start Sanctuary Broadcast'}</span>
        </button>
      </div>

      {/* Main Active Player Bar */}
      {selectedMedia && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071430] via-[#0B1F4D] to-[#201548] text-white shadow-xl space-y-4 border border-indigo-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold uppercase tracking-wider">
                Now Playing &bull; {selectedMedia.type}
              </span>
              <h2 className="font-serif-cinzel font-bold text-xl text-white">
                {selectedMedia.title}
              </h2>
              <div className="text-xs text-slate-300">
                Speaker: <strong>{selectedMedia.speaker}</strong> &bull; Date: {selectedMedia.date} &bull; Duration: {selectedMedia.duration}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>

              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-xs p-1.5 rounded-lg bg-black/40 border border-white/20 text-white cursor-pointer"
              >
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
          </div>

          {/* Waveform Scrubber Simulator */}
          <div className="space-y-2 pt-2">
            <div className="h-10 rounded-xl bg-black/40 p-2 flex items-center gap-1 overflow-hidden">
              {Array.from({ length: 48 }).map((_, i) => {
                const height = isPlaying
                  ? Math.sin(i * 0.4 + Date.now() * 0.005) * 16 + 18
                  : (i % 5 + 1) * 5;
                return (
                  <div
                    key={i}
                    style={{ height: `${Math.max(4, Math.min(28, height))}px` }}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      i < 20 ? 'bg-[#D4AF37]' : 'bg-slate-600/60'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>12:45</span>
              <span>{selectedMedia.duration}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Sermon Audio', 'Worship Music', 'Video Study', 'Slide Deck'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === cat
                ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
                : 'bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-400 hover:border-[#7D3AC1]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isCurrent = selectedMedia.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedMedia(item);
                setIsPlaying(true);
              }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-[#7D3AC1] dark:border-[#D4AF37] shadow-md'
                  : 'bg-white dark:bg-[#071430] border-slate-200 dark:border-indigo-950 hover:border-[#7D3AC1]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-500">{item.duration}</span>
                </div>

                <h4 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h4>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {item.speaker} &bull; {item.date}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-3">
                <span className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isCurrent && isPlaying ? 'Playing' : 'Listen'}</span>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Downloading media: ${item.title}`);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
