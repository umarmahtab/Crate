import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { RawgService } from '../../services/rawg/rawgClient';
import { downloadUserDataBackup, importUserData } from '../../utils/dataTransfer';
import { db } from '../../database/db';
import { gameRepository } from '../../database/repositories/gameRepository';
import { sessionRepository } from '../../database/repositories/sessionRepository';
import { getGamerRank, formatPlaytime } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from '../../components/common/Icons';
import { RankIcon } from '../../components/common/RankIcon';
import type { SortOption } from '../../types';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  ShieldCheck,
  Key,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  LayoutGrid,
  List,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Heart,
  Check,
  HardDrive,
  Clock,
  Radio,
  Sliders,
} from 'lucide-react';

const ACCENT_PRESETS = [
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Orange', color: '#f97316' },
];

const DARK_CANVAS_PRESETS = [
  { name: 'Obsidian', color: '#0c0e13' },
  { name: 'Deep Navy', color: '#0b0f19' },
  { name: 'Charcoal', color: '#13151b' },
  { name: 'Midnight', color: '#18181b' },
];

const LIGHT_CANVAS_PRESETS = [
  { name: 'Cool Slate', color: '#f7f9fc' },
  { name: 'Soft Sand', color: '#faf7f2' },
  { name: 'Clean Zinc', color: '#f4f4f5' },
  { name: 'Crisp White', color: '#ffffff' },
];

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateTheme,
    updateDefaultView,
    updateDefaultSort,
    updateRawgApiKey,
    updateAccentColor,
    updateBackgroundColor,
  } =
    useSettings();
  const { success, error } = useToast();

  const [apiKeyInput, setApiKeyInput] = useState(settings.rawgApiKey || '');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Profile Telemetry
  const [profileStats, setProfileStats] = useState<{
    totalGames: number;
    totalPlaytimeMinutes: number;
    completedCount: number;
  }>({ totalGames: 0, totalPlaytimeMinutes: 0, completedCount: 0 });

  // Clear database confirmation
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // File input ref for data import
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Load telemetry stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [games, sessions] = await Promise.all([
          gameRepository.getAll(),
          sessionRepository.getAll(),
        ]);
        const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const completed = games.filter((g) => g.status === 'completed').length;
        setProfileStats({
          totalGames: games.length,
          totalPlaytimeMinutes: totalMinutes,
          completedCount: completed,
        });
      } catch {
        // Fallback
      }
    };
    loadStats();
  }, []);

  const rank = getGamerRank(profileStats.totalPlaytimeMinutes, profileStats.completedCount);

  const handleSaveApiKey = () => {
    updateRawgApiKey(apiKeyInput.trim());
    setTestResult(null);
    success('API key updated.');
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    updateRawgApiKey('');
    setTestResult(null);
    success('API key cleared.');
  };

  const handleResetAppearance = () => {
    updateAccentColor('#f59e0b');
    updateBackgroundColor(settings.theme === 'dark' ? '#0c0e13' : '#f7f9fc');
    success('Appearance reset to default theme styling.');
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await RawgService.testConnection(apiKeyInput);
      setTestResult(res);
      if (res.success) {
        success('API connection verified!');
      } else {
        error(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test failed';
      setTestResult({ success: false, message: msg });
      error(msg);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleExportData = async () => {
    try {
      await downloadUserDataBackup();
      success('Library backup downloaded successfully.');
    } catch {
      error('Failed to export data.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importUserData(text, 'merge');
      success(
        `Imported ${result.importedGames} game${
          result.importedGames === 1 ? '' : 's'
        } and ${result.importedSessions} play session${
          result.importedSessions === 1 ? '' : 's'
        }!`
      );
      // Refresh profile stats
      const [games, sessions] = await Promise.all([
        gameRepository.getAll(),
        sessionRepository.getAll(),
      ]);
      const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      const completed = games.filter((g) => g.status === 'completed').length;
      setProfileStats({
        totalGames: games.length,
        totalPlaytimeMinutes: totalMinutes,
        completedCount: completed,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      error(msg);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await db.games.clear();
      await db.playSessions.clear();
      setProfileStats({ totalGames: 0, totalPlaytimeMinutes: 0, completedCount: 0 });
      success('Local database cleared successfully.');
      setIsClearDataOpen(false);
    } catch {
      error('Failed to clear database.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. GAMER COMMAND PASSPORT HEADER */}
      <div className="relative overflow-hidden rounded-3xl frosted-card p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-neutral-950 font-black text-2xl shadow-sm shrink-0">
              <Gamepad2 className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Level {rank.level} • {rank.title}</span>
                </span>
                <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm">
                  <RankIcon iconKey={rank.iconKey} size="sm" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
                Settings & Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">
                Personalized settings, visual styling, and local database storage.
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 text-center shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">Games</span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">{profileStats.totalGames}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 text-center shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">Time</span>
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{formatPlaytime(profileStats.totalPlaytimeMinutes)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 text-center shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">Beaten</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{profileStats.completedCount}</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/20 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-neutral-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Next Rank Milestone</span>
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{rank.progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${rank.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. APPEARANCE & DISPLAY */}
      <div className="p-6 sm:p-7 rounded-3xl frosted-card space-y-6 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Appearance & Display
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Customize interface theme, default layout view, and library sorting.
            </p>
          </div>
        </div>

        {/* Interactive Theme Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-3">
            Interface Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode Card Preview */}
            <div
              onClick={() => updateTheme('dark')}
              role="button"
              tabIndex={0}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                settings.theme === 'dark'
                  ? 'border-amber-500 bg-neutral-950 shadow-[0_0_24px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/30'
                  : 'border-slate-200 dark:border-neutral-800 bg-neutral-950/70 hover:border-amber-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm">Obsidian Dark</span>
                </div>
                {settings.theme === 'dark' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-500 font-semibold group-hover:text-amber-400">Click to Select</span>
                )}
              </div>

              {/* Mini visual mockup */}
              <div className="h-20 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-2 rounded-full bg-neutral-700" />
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-10 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0" />
                  <div className="flex-1 space-y-1.5 py-1">
                    <div className="w-3/4 h-2 rounded bg-neutral-700" />
                    <div className="w-1/2 h-1.5 rounded bg-amber-500/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Light Mode Card Preview */}
            <div
              onClick={() => updateTheme('light')}
              role="button"
              tabIndex={0}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                settings.theme === 'light'
                  ? 'border-amber-500 bg-slate-50 shadow-[0_0_24px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/30'
                  : 'border-slate-200 dark:border-neutral-800 bg-slate-100 hover:border-amber-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm">Luminous Light</span>
                </div>
                {settings.theme === 'light' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold group-hover:text-amber-600">Click to Select</span>
                )}
              </div>

              {/* Mini visual mockup */}
              <div className="h-20 rounded-xl bg-white border border-slate-200 p-2.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-2 rounded-full bg-slate-200" />
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5 py-1">
                    <div className="w-3/4 h-2 rounded bg-slate-300" />
                    <div className="w-1/2 h-1.5 rounded bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accent Color Studio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-neutral-950/45 border border-slate-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200">
                Accent Color Studio
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                Buttons, interactive stars, focus brackets, and active indicators
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-neutral-850 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm text-xs font-semibold text-slate-700 dark:text-neutral-300">
              <span className="text-[11px]">Custom Hex</span>
              <input
                type="color"
                value={settings.accentColor || '#f59e0b'}
                onChange={(e) => updateAccentColor(e.target.value)}
                className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer"
                aria-label="Pick custom accent color"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = settings.accentColor?.toLowerCase() === preset.color.toLowerCase();
              return (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => updateAccentColor(preset.color)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 bg-white dark:bg-neutral-850 shadow-sm'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white/60 dark:bg-neutral-900/60'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 truncate">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Atmospheric Canvas Tone */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-neutral-950/45 border border-slate-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200">
                Atmospheric Canvas Tone
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                Base color beneath the atmospheric ambient gradient
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-neutral-850 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm text-xs font-semibold text-slate-700 dark:text-neutral-300">
              <span className="text-[11px]">Custom Hex</span>
              <input
                type="color"
                value={settings.backgroundColor || (settings.theme === 'dark' ? '#0c0e13' : '#f7f9fc')}
                onChange={(e) => updateBackgroundColor(e.target.value)}
                className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer"
                aria-label="Pick custom canvas color"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(settings.theme === 'dark' ? DARK_CANVAS_PRESETS : LIGHT_CANVAS_PRESETS).map((preset) => {
              const isSelected = settings.backgroundColor?.toLowerCase() === preset.color.toLowerCase();
              return (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => updateBackgroundColor(preset.color)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 bg-white dark:bg-neutral-850 shadow-sm'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white/60 dark:bg-neutral-900/60'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 truncate">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleResetAppearance}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white underline font-semibold transition-colors"
            >
              Reset to Default Appearance
            </button>
          </div>
        </div>

        {/* View Mode & Default Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Default View Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">
              Default Library Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateDefaultView('grid')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm ${
                  settings.defaultView === 'grid'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/40'
                    : 'bg-slate-50 dark:bg-neutral-850 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-amber-500" />
                <span>Grid View</span>
              </button>
              <button
                type="button"
                onClick={() => updateDefaultView('list')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm ${
                  settings.defaultView === 'list'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/40'
                    : 'bg-slate-50 dark:bg-neutral-850 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4 text-amber-500" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {/* Default Sorting */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">
              Default Sorting Order
            </label>
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 pointer-events-none" />
              <select
                value={settings.defaultSort}
                onChange={(e) => updateDefaultSort(e.target.value as SortOption)}
                className="w-full bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer shadow-sm"
              >
                <option value="recent-added">Recently Added</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="playtime-desc">Most Playtime</option>
                <option value="release-desc">Release Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. METADATA ENGINE (RAWG API) */}
      <div className="p-6 sm:p-7 rounded-3xl frosted-card space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Metadata Engine
                </h2>
                {settings.rawgApiKey ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                    OFFLINE CATALOG
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Connect an optional API key for online game searches and automatic cover artwork.
              </p>
            </div>
          </div>

          <a
            href="https://rawg.io/apidocs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Get Free Key</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Enter personal API Key..."
                className="w-full frosted-pill rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleSaveApiKey}>
                Save Key
              </Button>
              <Button
                variant="outline"
                onClick={handleTestApiKey}
                isLoading={isTestingKey}
                disabled={!apiKeyInput.trim()}
              >
                Test Ping
              </Button>
              {(apiKeyInput || settings.rawgApiKey) && (
                <Button
                  variant="ghost"
                  onClick={handleClearApiKey}
                  className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  Clear Key
                </Button>
              )}
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">
            API access is 100% optional. Crate works completely offline with instant manual entry and built-in sample collection.
          </p>
        </div>
      </div>

      {/* 4. DATA & BACKUPS */}
      <div className="p-6 sm:p-7 rounded-3xl frosted-card space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Data & Backups
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Local-first persistent storage. Your entire catalog lives inside your device.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold frosted-pill text-slate-700 dark:text-neutral-300 self-start sm:self-auto font-mono">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            IndexedDB Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export Card */}
          <div className="p-5 rounded-2xl frosted-pill flex flex-col justify-between gap-4 shadow-sm hover:border-[var(--accent)]/40 transition-all">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Download className="w-4 h-4 text-[var(--accent)]" />
                <span>Export Backup</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Generate a complete portable JSON file containing all games, platforms, ratings, and play session history.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportData}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export Backup (.json)
            </Button>
          </div>

          {/* Import Card */}
          <div className="p-5 rounded-2xl frosted-pill flex flex-col justify-between gap-4 shadow-sm hover:border-[var(--accent)]/40 transition-all">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Restore Backup</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Restore previously exported JSON backups. Merges smoothly with existing catalog without creating duplicate entries.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isImporting}
                icon={<Upload className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Import Backup (.json)
              </Button>
            </div>
          </div>
        </div>

        {/* Clear Data Danger Zone */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Reset Local Storage</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Permanently purges all games and play sessions from this browser.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsClearDataOpen(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All Data
          </Button>
        </div>
      </div>

      {/* 5. CREATOR & COMMUNITY SHOWCASE */}
      <div className="p-6 sm:p-7 rounded-3xl frosted-card space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                Made by umarmahtab
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
              Crate — Minimal, fast, and local-first personal video game tracking web application.
            </p>
          </div>

          {/* Social Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="https://github.com/umarmahtab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-100 transition-all border border-slate-200 dark:border-neutral-700 shadow-sm hover:scale-105"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/umar-mahtab-607861325"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-all border border-blue-200 dark:border-blue-800 shadow-sm hover:scale-105"
            >
              <LinkedInIcon className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://instagram.com/umarmahtab18"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/60 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 transition-all border border-pink-200 dark:border-pink-800 shadow-sm hover:scale-105"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-neutral-400">
          <span>
            Game metadata and artwork powered by{' '}
            <a
              href="https://rawg.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline underline-offset-2 font-bold"
            >
              RAWG.io
            </a>
          </span>
          <span className="font-mono text-[11px] text-slate-400 dark:text-neutral-500">Crate v1.0 • Built with React & Dexie</span>
        </div>
      </div>

      {/* Clear Database Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
        onConfirm={handleClearAllData}
        title="Wipe Local Save Vault?"
        message="This action will permanently delete all stored games, play sessions, and settings from this browser. This action cannot be undone unless you have a recent JSON snapshot backup."
        confirmLabel="Wipe Everything"
        isDestructive={true}
        isLoading={isClearing}
      />
    </div>
  );
};
