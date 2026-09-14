import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  HeartHandshake,
  ScanEye,
  Sparkles,
  Briefcase,
  CalendarDays,
  Users,
  Megaphone,
  Video,
  Library,
  Scale,
  Settings,
  MapPin,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Star,
  RotateCcw,
  Menu,
  X,
  ShieldCheck,
  Package,
  Compass,
  CreditCard
} from 'lucide-react';
import { SidebarTool } from '../types';

interface SidebarProps {
  tools: SidebarTool[];
  activeToolId: string;
  onSelectTool: (id: string) => void;
  onReorderTools: (newTools: SidebarTool[]) => void;
  onResetTools: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  theme: 'light' | 'dark' | 'system';
  onOpenTour?: () => void;
  onOpenThinkBible?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  ScanEye: <ScanEye className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  CalendarDays: <CalendarDays className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Megaphone: <Megaphone className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Library: <Library className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />
};

export const Sidebar: React.FC<SidebarProps> = ({
  tools,
  activeToolId,
  onSelectTool,
  onReorderTools,
  onResetTools,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  theme,
  onOpenTour,
  onOpenThinkBible
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...tools];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);

    // Update orders & top 3 favorites
    const reordered = updated.map((t, idx) => ({
      ...t,
      order: idx + 1,
      isFavorite: idx < 3
    }));

    setDraggedIndex(index);
    onReorderTools(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tools.length) return;

    const updated = [...tools];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((t, idx) => ({
      ...t,
      order: idx + 1,
      isFavorite: idx < 3
    }));
    onReorderTools(reordered);
  };

  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Single Panel Sidebar */}
      <aside
        id="main-sidebar-panel"
        className={`fixed md:sticky top-0 h-screen z-50 transition-all duration-300 flex flex-col no-print
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDark ? 'bg-[#071430] border-r border-indigo-950 text-slate-100' : 'bg-[#0B1F4D] border-r border-[#0B1F4D]/20 text-white'}
          shadow-2xl shadow-blue-950/40 select-none
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7D3AC1] to-[#D4AF37] flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif-cinzel font-bold text-sm tracking-wide text-white truncate">
                  CHURCH MINISTRY
                </span>
                <span className="text-[10px] text-[#D4AF37] font-medium tracking-wider uppercase">
                  Holy Spirit &bull; Vision Hub
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              id="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            {/* Mobile Close */}
            <button
              id="sidebar-mobile-close-btn"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top 3 Favorites Badge Info (when expanded) */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] text-slate-300 font-semibold tracking-wider uppercase">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
              Navigation Panel (Drag to Reorder)
            </span>
            <button
              onClick={onResetTools}
              title="Reset default sidebar order"
              className="p-1 hover:text-[#D4AF37] rounded hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Tool Buttons List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {tools.map((tool, index) => {
            const isActive = tool.id === activeToolId;
            const isTopFavorite = index < 3;

            return (
              <div
                key={tool.id}
                id={`sidebar-item-${tool.id}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative flex items-center rounded-xl transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-gradient-to-r from-[#7D3AC1] to-[#6023A1] text-white shadow-lg shadow-purple-900/40 font-medium ring-1 ring-[#D4AF37]/50'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }
                  ${draggedIndex === index ? 'opacity-40 scale-95' : 'opacity-100'}
                `}
              >
                {/* Drag Handle (Expanded only) */}
                {!isCollapsed && (
                  <div
                    title="Drag to reorder"
                    className="pl-2 pr-1 py-3 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Main Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectTool(tool.id);
                    onCloseMobile();
                  }}
                  title={`${tool.name} - ${tool.description}`}
                  className={`flex-1 flex items-center gap-3 py-2.5 ${isCollapsed ? 'justify-center px-0' : 'pr-2'}`}
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <span className={`${isActive ? 'text-[#D4AF37]' : 'text-slate-300 group-hover:text-[#D4AF37]'} transition-colors`}>
                      {iconMap[tool.iconName] || <LayoutDashboard className="w-5 h-5" />}
                    </span>
                    {isTopFavorite && isCollapsed && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                      <span className="text-sm font-medium truncate">{tool.name}</span>
                      {isTopFavorite && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                          ★ Fav
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Up / Down Reorder Arrows on Hover for Accessibility */}
                {!isCollapsed && (
                  <div className="pr-2 opacity-0 group-hover:opacity-100 flex flex-col text-[10px] text-slate-400 gap-0.5">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, 'up');
                        }}
                        className="hover:text-[#D4AF37] px-0.5"
                        title="Move Up"
                      >
                        ▲
                      </button>
                    )}
                    {index < tools.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, 'down');
                        }}
                        className="hover:text-[#D4AF37] px-0.5"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Feature Tour & ThinkBible Actions */}
        <div className="px-2 py-2 border-t border-white/10 flex flex-col gap-1.5 bg-black/15 shrink-0">
          {onOpenTour && (
            <button
              id="sidebar-tour-btn"
              type="button"
              onClick={onOpenTour}
              title="Start App Feature Tour"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <Compass className="w-4 h-4 text-[#D4AF37] shrink-0" />
              {!isCollapsed && <span>App Feature Tour</span>}
            </button>
          )}

          {onOpenThinkBible && (
            <button
              id="sidebar-thinkbible-btn"
              type="button"
              onClick={onOpenThinkBible}
              title="Open ThinkBible AI Assistant"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7D3AC1]/50 via-[#0B1F4D] to-[#7D3AC1]/50 border border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-xs hover:opacity-95 transition-all active:scale-95 ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 animate-pulse" />
              {!isCollapsed && <span>Ask ThinkBible</span>}
            </button>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 shrink-0 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-200 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-200 truncate">Theological Guard</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">A2A Judge Active &bull; KJV Corpus</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
