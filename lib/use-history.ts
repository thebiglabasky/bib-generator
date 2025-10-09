import { TemplateElement } from '@/types';
import { useCallback, useRef, useState } from 'react';

export type ActionType = 'move' | 'resize' | 'rotate' | 'property' | 'add' | 'delete' | 'reorder';

interface HistoryEntry {
  type: ActionType;
  elementId: string;
  beforeState: TemplateElement | null; // State before the action (null for add)
  afterState: TemplateElement | null; // State after the action (null for delete)
  timestamp: number;
}

const MAX_HISTORY = 20;
const DEBOUNCE_DELAY = 500;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const pendingActionRef = useRef<{
    type: ActionType;
    elementId: string;
    beforeState: TemplateElement | null;
    afterState: TemplateElement | null;
    timeoutId: NodeJS.Timeout;
  } | null>(null);
  const isUndoRedoRef = useRef(false);

  const commitPendingAction = useCallback(() => {
    if (pendingActionRef.current) {
      clearTimeout(pendingActionRef.current.timeoutId);
      const { type, elementId, beforeState, afterState } = pendingActionRef.current;

      setHistory(prev => {
        // Remove any entries after current index (when we make a new change after undo)
        const newHistory = prev.slice(0, currentIndex + 1);
        // Add new entry
        newHistory.push({
          type,
          elementId,
          beforeState,
          afterState,
          timestamp: Date.now()
        });
        // Keep only last MAX_HISTORY entries
        if (newHistory.length > MAX_HISTORY) {
          return newHistory.slice(newHistory.length - MAX_HISTORY);
        }
        return newHistory;
      });

      setCurrentIndex(prev => {
        const newHistory = history.slice(0, prev + 1);
        newHistory.push({
          type,
          elementId,
          beforeState,
          afterState,
          timestamp: Date.now()
        });
        return Math.min(newHistory.length - 1, MAX_HISTORY - 1);
      });

      pendingActionRef.current = null;
    }
  }, [currentIndex, history]);

  const recordAction = useCallback((
    type: ActionType,
    elementId: string,
    beforeState: TemplateElement | null,
    afterState: TemplateElement | null
  ) => {
    // Don't record if we're in an undo/redo operation
    if (isUndoRedoRef.current) {
      return;
    }

    // If we have a pending action
    if (pendingActionRef.current) {
      // If it's the same element and same type, just update the after state and reset timer
      if (pendingActionRef.current.elementId === elementId &&
          pendingActionRef.current.type === type) {
        clearTimeout(pendingActionRef.current.timeoutId);
        pendingActionRef.current.afterState = afterState;
        pendingActionRef.current.timeoutId = setTimeout(commitPendingAction, DEBOUNCE_DELAY);
        return;
      } else {
        // Different element or type - commit the pending action immediately
        commitPendingAction();
      }
    }

    // For immediate actions (add, delete), commit right away
    if (type === 'add' || type === 'delete' || type === 'reorder') {
      setHistory(prev => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({
          type,
          elementId,
          beforeState,
          afterState,
          timestamp: Date.now()
        });
        if (newHistory.length > MAX_HISTORY) {
          return newHistory.slice(newHistory.length - MAX_HISTORY);
        }
        return newHistory;
      });
      setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
    } else {
      // For continuous actions (move, resize, rotate, property), debounce
      const timeoutId = setTimeout(commitPendingAction, DEBOUNCE_DELAY);
      pendingActionRef.current = {
        type,
        elementId,
        beforeState,
        afterState,
        timeoutId
      };
    }
  }, [currentIndex, commitPendingAction]);

  const undo = useCallback((): HistoryEntry | null => {
    if (currentIndex < 0) return null;

    // Commit any pending action first
    if (pendingActionRef.current) {
      commitPendingAction();
    }

    isUndoRedoRef.current = true;
    const entry = history[currentIndex];
    setCurrentIndex(prev => prev - 1);

    // Reset flag after a brief delay
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);

    return entry;
  }, [currentIndex, history, commitPendingAction]);

  const redo = useCallback((): HistoryEntry | null => {
    if (currentIndex >= history.length - 1) return null;

    isUndoRedoRef.current = true;
    const entry = history[currentIndex + 1];
    setCurrentIndex(prev => prev + 1);

    // Reset flag after a brief delay
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);

    return entry;
  }, [currentIndex, history]);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex
  };
}

