import { useState, useEffect, useCallback } from 'react';

export interface MatchPostDraft {
  locationType: 'home_ground' | 'custom';
  customLocationName: string;
  customLocationAddress: string;
  matchDate: string;
  matchTimeStart: string;
  matchTimeEnd: string;
  targetLevels: string[];
  description: string;
  savedAt: number;
}

const DRAFT_KEY = 'match_post_draft';
const DRAFT_EXPIRY_HOURS = 24;

export function useMatchPostDraft(teamId: string | null) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draft, setDraft] = useState<MatchPostDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    if (!teamId) return;

    const storedDraft = localStorage.getItem(`${DRAFT_KEY}_${teamId}`);
    if (storedDraft) {
      try {
        const parsed: MatchPostDraft = JSON.parse(storedDraft);
        
        // Check if draft is expired (24 hours)
        const hoursSinceSave = (Date.now() - parsed.savedAt) / (1000 * 60 * 60);
        if (hoursSinceSave < DRAFT_EXPIRY_HOURS) {
          setDraft(parsed);
          setHasDraft(true);
          setDraftSavedAt(new Date(parsed.savedAt));
        } else {
          // Clear expired draft
          localStorage.removeItem(`${DRAFT_KEY}_${teamId}`);
        }
      } catch (e) {
        localStorage.removeItem(`${DRAFT_KEY}_${teamId}`);
      }
    }
  }, [teamId]);

  // Save draft
  const saveDraft = useCallback((data: Omit<MatchPostDraft, 'savedAt'>) => {
    if (!teamId) return;

    const draftWithTime: MatchPostDraft = {
      ...data,
      savedAt: Date.now(),
    };

    localStorage.setItem(`${DRAFT_KEY}_${teamId}`, JSON.stringify(draftWithTime));
    setDraft(draftWithTime);
    setHasDraft(true);
    setDraftSavedAt(new Date());
  }, [teamId]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (!teamId) return;

    localStorage.removeItem(`${DRAFT_KEY}_${teamId}`);
    setDraft(null);
    setHasDraft(false);
    setDraftSavedAt(null);
  }, [teamId]);

  return {
    hasDraft,
    draft,
    draftSavedAt,
    saveDraft,
    clearDraft,
  };
}
