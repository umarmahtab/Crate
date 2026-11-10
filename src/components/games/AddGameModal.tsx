import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusSelect } from '../ui/StatusSelect';
import { RatingStars } from '../ui/RatingStars';
import { GameCoverImage } from '../common/GameCoverImage';
import { RawgService } from '../../services/rawg/rawgClient';
import type { RawgGameSearchResult } from '../../services/rawg/types';
import type { Game, GameStatus } from '../../types';
import { COMMON_PLATFORMS } from '../../utils/status';
import { gameRepository } from '../../database/repositories/gameRepository';
import { useToast } from '../../contexts/ToastContext';
import { Search, PlusCircle, Check, ArrowLeft, Gamepad2, Sparkles, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: GameStatus;
  gameToEdit?: Game | null;
  onGameSaved?: (game: Game) => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  defaultStatus = 'backlog',
  gameToEdit = null,
  onGameSaved,
}) => {
  const { success, error, info } = useToast();

  const isEditMode = Boolean(gameToEdit);

  // Mode: 'search' | 'manual' | 'configure-imported'
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RawgGameSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [existingExternalIds, setExistingExternalIds] = useState<Set<number>>(new Set());

  // Form configuration state for newly added or edited game
  const [selectedRawgId, setSelectedRawgId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('PC');
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [status, setStatus] = useState<GameStatus>(defaultStatus);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'pick' | 'customize'>('pick');

  // Load existing external IDs to prevent duplicate additions
  const loadExistingGames = useCallback(async () => {
    try {
      const allGames = await gameRepository.getAll();
      const idSet = new Set<number>();
      for (const g of allGames) {
        if (g.externalId) idSet.add(g.externalId);
      }
      setExistingExternalIds(idSet);
    } catch {
      // Ignore
    }
  }, []);

  const handleInitialSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const res = await RawgService.searchGames('');
      setSearchResults(res.results);
      setIsFallbackData(res.isFallback);
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadExistingGames();

      if (gameToEdit) {
        setActiveTab('manual');
        setStep('customize');
        setSelectedRawgId(gameToEdit.externalId || null);
        setTitle(gameToEdit.title);
        setDescription(gameToEdit.description || '');
        setCoverUrl(gameToEdit.coverUrl || '');
        setReleaseDate(gameToEdit.releaseDate || '');
        setGenres(gameToEdit.genres || []);
        setSelectedPlatform(gameToEdit.selectedPlatform || 'PC');
        setDeveloper(gameToEdit.developer || '');
        setPublisher(gameToEdit.publisher || '');
        setStatus(gameToEdit.status);
        setRating(gameToEdit.rating ?? null);
        setNotes(gameToEdit.notes || '');
      } else {
        // Reset state for new addition
        setActiveTab('search');
        setStep('pick');
        setSelectedRawgId(null);
        setTitle('');
        setDescription('');
        setCoverUrl('');
        setReleaseDate('');
        setGenres([]);
        setSelectedPlatform('PC');
        setDeveloper('');
        setPublisher('');
        setStatus(defaultStatus);
        setRating(null);
        setNotes('');
        setSearchQuery('');
        // Pre-load popular games in search
        handleInitialSearch();
      }
    }
  }, [isOpen, gameToEdit, defaultStatus, loadExistingGames, handleInitialSearch]);

  // Perform search with debounce and abort controller
  useEffect(() => {
    if (activeTab !== 'search' || isEditMode) return;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await RawgService.searchGames(searchQuery, { signal: controller.signal });
        setSearchResults(res.results);
        setIsFallbackData(res.isFallback);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, activeTab, isEditMode]);

  // Handle selecting a RAWG game result
  const handleSelectSearchResult = async (gameItem: RawgGameSearchResult) => {
    // Duplicate check
    if (existingExternalIds.has(gameItem.id)) {
      info(`"${gameItem.name}" is already in your library!`);
      return;
    }

    setIsSearching(true);
    try {
      const details = await RawgService.getGameDetails(gameItem.id);

      setSelectedRawgId(details.id);
      setTitle(details.name);
      setDescription(details.description_raw || details.description || '');
      setCoverUrl(details.background_image || '');
      setReleaseDate(details.released || '');

      const extractedGenres = (details.genres || []).map((g) => g.name);
      setGenres(extractedGenres);

      const platformsList = (details.platforms || []).map((p) => p.platform.name);
      setAvailablePlatforms(platformsList);

      // Pick reasonable default platform
      if (platformsList.length > 0) {
        const preferred = platformsList.find((p) =>
          ['PC', 'PlayStation 5', 'PlayStation 4', 'Nintendo Switch', 'Xbox Series S/X'].includes(p)
        );
        setSelectedPlatform(preferred || platformsList[0]);
      } else {
        setSelectedPlatform('PC');
      }

      // If unreleased, auto-suggest Wishlist
      if (details.released) {
        const releaseTime = new Date(details.released).getTime();
        if (releaseTime > Date.now()) {
          setStatus('wishlist');
        } else if (defaultStatus === 'wishlist') {
          setStatus('wishlist');
        } else {
          setStatus(defaultStatus);
        }
      } else {
        setStatus(defaultStatus);
      }

      const devs = (details.developers || []).map((d) => d.name).join(', ');
      setDeveloper(devs);

      const pubs = (details.publishers || []).map((p) => p.name).join(', ');
      setPublisher(pubs);

      // Move to customize step
      setStep('customize');
    } catch {
      // Fallback with basic metadata if details call failed
      setSelectedRawgId(gameItem.id);
      setTitle(gameItem.name);
      setCoverUrl(gameItem.background_image || '');
      setReleaseDate(gameItem.released || '');
      setGenres((gameItem.genres || []).map((g) => g.name));
      const platformsList = (gameItem.platforms || []).map((p) => p.platform.name);
      setAvailablePlatforms(platformsList);
      setSelectedPlatform(platformsList[0] || 'PC');
      setStep('customize');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Game title is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode && gameToEdit) {
        await gameRepository.update(gameToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          releaseDate: releaseDate.trim() || undefined,
          genres,
          developer: developer.trim() || undefined,
          publisher: publisher.trim() || undefined,
          selectedPlatform: selectedPlatform.trim() || 'PC',
          status,
          rating,
          notes: notes.trim() || undefined,
        });

        success(`Updated "${title}"`);
        if (onGameSaved) {
          onGameSaved({
            ...gameToEdit,
            title: title.trim(),
            description: description.trim() || undefined,
            coverUrl: coverUrl.trim() || undefined,
            releaseDate: releaseDate.trim() || undefined,
            genres,
            developer: developer.trim() || undefined,
            publisher: publisher.trim() || undefined,
            selectedPlatform: selectedPlatform.trim() || 'PC',
            status,
            rating,
            notes: notes.trim() || undefined,
            dateUpdated: new Date().toISOString(),
          });
        }
      } else {
        // Prevent duplicate check again
        if (selectedRawgId && existingExternalIds.has(selectedRawgId)) {
          error(`"${title}" is already in your library.`);
          setIsSaving(false);
          return;
        }

        const newGame = await gameRepository.create({
          externalId: selectedRawgId,
          title: title.trim(),
          description: description.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          releaseDate: releaseDate.trim() || undefined,
          genres,
          platforms: availablePlatforms.length > 0 ? availablePlatforms : [selectedPlatform],
          developer: developer.trim() || undefined,
          publisher: publisher.trim() || undefined,
          selectedPlatform: selectedPlatform.trim() || 'PC',
          status,
          rating,
          notes: notes.trim() || undefined,
        });

        // Trigger confetti celebration if added as completed
        if (status === 'completed') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        success(`Added "${title}" to your library!`);
        if (onGameSaved) onGameSaved(newGame);
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save game.';
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = genreInput.trim().replace(/^,+|,+$/g, '');
      if (val && !genres.includes(val)) {
        setGenres([...genres, val]);
        setGenreInput('');
      }
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenres(genres.filter((g) => g !== genreToRemove));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Edit3 className="w-5 h-5 text-[var(--accent)]" />
              <span>Edit Game</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 text-[var(--accent)]" />
              <span>Add Game to Library</span>
            </>
          )}
        </div>
      }
      description={
        isEditMode
          ? 'Modify metadata, personal platform, status, or notes.'
          : 'Search the game database or enter game details manually.'
      }
    >
      {/* Mode navigation for new game addition */}
      {!isEditMode && step === 'pick' && (
        <div className="flex border-b border-slate-200 dark:border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Database</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              setStep('customize');
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
        </div>
      )}

      {/* STEP 1: Search View */}
      {!isEditMode && step === 'pick' && activeTab === 'search' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title (e.g., Cyberpunk, Zelda, Elden Ring)..."
              className="w-full bg-slate-50 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
          </div>

          {/* Fallback Notice when using offline sample collection */}
          {isFallbackData && (
            <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl flex items-center gap-2 text-xs text-slate-800 dark:text-neutral-200">
              <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>
                Browsing offline catalog. Add your free API key in Settings to search the entire online database.
              </span>
            </div>
          )}

          {/* Results list */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {isSearching ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-neutral-400 text-sm gap-2">
                <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span>Searching games...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-neutral-400 text-sm">
                <p>No games found matching "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manual');
                    setStep('customize');
                    setTitle(searchQuery);
                  }}
                  className="mt-3 text-[var(--accent)] hover:brightness-110 font-medium text-xs underline underline-offset-4"
                >
                  Enter game details manually instead
                </button>
              </div>
            ) : (
              searchResults.map((gameItem) => {
                const isAlreadyAdded = existingExternalIds.has(gameItem.id);
                return (
                  <div
                    key={gameItem.id}
                    onClick={() => !isAlreadyAdded && handleSelectSearchResult(gameItem)}
                    className={`flex items-center justify-between gap-3.5 p-2.5 rounded-xl border transition-all ${
                      isAlreadyAdded
                        ? 'opacity-60 bg-slate-100 dark:bg-neutral-900/40 border-slate-200 dark:border-neutral-800/40 cursor-not-allowed'
                        : 'bg-white dark:bg-neutral-850 hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 cursor-pointer shadow-sm hover:shadow'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-800">
                        <GameCoverImage
                          src={gameItem.background_image}
                          alt={gameItem.name}
                          aspectRatio="vertical"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 truncate">
                          {gameItem.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {gameItem.released && (
                            <span className="text-xs text-slate-500 dark:text-neutral-400">
                              {gameItem.released.split('-')[0]}
                            </span>
                          )}
                          {gameItem.genres && gameItem.genres.length > 0 && (
                            <span className="text-xs text-slate-500 dark:text-neutral-400">
                              • {gameItem.genres.slice(0, 2).map((g) => g.name).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAlreadyAdded ? (
                        <span className="text-[11px] font-medium px-2 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 rounded-lg border border-slate-200 dark:border-neutral-700/50 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          In Library
                        </span>
                      ) : (
                        <Button variant="secondary" size="sm">
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Customize & Confirm Details */}
      {(step === 'customize' || activeTab === 'manual') && (
        <form onSubmit={handleSaveGame} className="space-y-4">
          {!isEditMode && activeTab === 'search' && (
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors pb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to search results</span>
            </button>
          )}

          {/* Preview Header */}
          <div className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-200 dark:border-neutral-800">
            <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-700/60 shadow-sm">
              <GameCoverImage src={coverUrl} alt={title || 'Game cover'} aspectRatio="vertical" />
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Game Title"
                className="w-full font-bold text-base bg-transparent text-slate-900 dark:text-neutral-100 border-b border-transparent hover:border-slate-300 dark:hover:border-neutral-700 focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Developer (optional)"
                  className="text-xs bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/60 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-neutral-300 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50"
                />
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="text-xs bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/60 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50"
                />
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-2">
              Game Status
            </label>
            <StatusSelect value={status} onChange={setStatus} />
          </div>

          {/* Platform Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
                Your Platform
              </label>
              {availablePlatforms.length > 0 ? (
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                >
                  {availablePlatforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="Other">Other / Emulation</option>
                </select>
              ) : (
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                >
                  {COMMON_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
                Personal Rating
              </label>
              <div className="flex items-center h-10 px-3 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 rounded-xl">
                <RatingStars value={rating} onChange={setRating} size="md" showNumber />
              </div>
            </div>
          </div>

          {/* Cover image URL input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
          </div>

          {/* Genres Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
              Genres (Press Enter to add)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl min-h-[42px]">
              {genres.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-neutral-700 text-slate-800 dark:text-neutral-200 px-2 py-0.5 rounded-lg"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(g)}
                    className="hover:text-rose-500 text-slate-500 dark:text-neutral-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={handleAddGenre}
                placeholder={genres.length === 0 ? 'e.g. Action, RPG, Sci-Fi' : 'Add genre...'}
                className="bg-transparent text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none flex-1 min-w-[100px] px-1"
              />
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
              Personal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Purchased in Steam Winter sale, playing with friends..."
              className="w-full bg-white dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-neutral-800">
            <span className="text-[11px] text-slate-500 dark:text-neutral-500">
              {selectedRawgId ? `Verified Database Entry (#${selectedRawgId})` : 'Custom manual game'}
            </span>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isSaving}>
                {isEditMode ? 'Save Changes' : 'Add Game'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
