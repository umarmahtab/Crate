import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { PlaySession } from '../../types';
import { sessionRepository } from '../../database/repositories/sessionRepository';
import { useToast } from '../../contexts/ToastContext';
import { getLocalDateString } from '../../utils/format';
import { Clock } from 'lucide-react';

interface PlaySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  sessionToEdit?: PlaySession | null;
  onSessionSaved?: () => void;
}

const PlaySessionForm: React.FC<{
  gameId: string;
  gameTitle: string;
  sessionToEdit?: PlaySession | null;
  onClose: () => void;
  onSessionSaved?: () => void;
}> = ({ gameId, gameTitle, sessionToEdit, onClose, onSessionSaved }) => {
  const { success, error } = useToast();

  const [date, setDate] = useState(() => {
    if (sessionToEdit) {
      return sessionToEdit.date.includes('T')
        ? sessionToEdit.date.split('T')[0]
        : sessionToEdit.date;
    }
    return getLocalDateString();
  });

  const [hours, setHours] = useState(() =>
    sessionToEdit ? Math.floor(sessionToEdit.durationMinutes / 60) : 1
  );

  const [minutes, setMinutes] = useState(() =>
    sessionToEdit ? sessionToEdit.durationMinutes % 60 : 0
  );

  const [notes, setNotes] = useState(() => sessionToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) {
      error('Please enter a session duration greater than 0.');
      return;
    }

    if (!date) {
      error('Please select a valid date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (sessionToEdit) {
        await sessionRepository.update(sessionToEdit.id, {
          date,
          durationMinutes: totalMinutes,
          notes: notes.trim() || undefined,
        });
        success('Play session updated successfully.');
      } else {
        await sessionRepository.create({
          gameId,
          date,
          durationMinutes: totalMinutes,
          notes: notes.trim() || undefined,
        });
        success(`Logged ${hours}h ${minutes}m for ${gameTitle}!`);
      }

      if (onSessionSaved) onSessionSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save session.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
          Date
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-50 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Duration input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
          Duration
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center bg-slate-50 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3 py-2">
              <input
                type="number"
                min="0"
                max="100"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-transparent text-slate-900 dark:text-neutral-100 text-sm focus:outline-none"
              />
              <span className="text-xs text-slate-500 dark:text-neutral-400 ml-1">hrs</span>
            </div>
          </div>
          <div>
            <div className="flex items-center bg-slate-50 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3 py-2">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) =>
                  setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                }
                className="w-full bg-transparent text-slate-900 dark:text-neutral-100 text-sm focus:outline-none"
              />
              <span className="text-xs text-slate-500 dark:text-neutral-400 ml-1">mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick duration buttons */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-slate-500 dark:text-neutral-400">Quick set:</span>
        {[
          { label: '+30m', h: 0, m: 30 },
          { label: '+1h', h: 1, m: 0 },
          { label: '+2h', h: 2, m: 0 },
          { label: '+3h', h: 3, m: 0 },
        ].map((quick) => (
          <button
            type="button"
            key={quick.label}
            onClick={() => {
              setHours(quick.h);
              setMinutes(quick.m);
            }}
            className="text-xs font-medium px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg transition-colors border border-slate-200 dark:border-neutral-700/60"
          >
            {quick.label}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
          Session Notes (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Beat chapter 4 boss, collected 15 power stars..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-50 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {sessionToEdit ? 'Save Changes' : 'Log Session'}
        </Button>
      </div>
    </form>
  );
};

export const PlaySessionModal: React.FC<PlaySessionModalProps> = ({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  sessionToEdit,
  onSessionSaved,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>{sessionToEdit ? 'Edit Play Session' : 'Log Play Session'}</span>
        </div>
      }
      description={`Tracking gameplay for "${gameTitle}"`}
      maxWidth="md"
    >
      <PlaySessionForm
        key={sessionToEdit?.id || 'new-session'}
        gameId={gameId}
        gameTitle={gameTitle}
        sessionToEdit={sessionToEdit}
        onClose={onClose}
        onSessionSaved={onSessionSaved}
      />
    </Modal>
  );
};
