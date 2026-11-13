import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import bundledSnippets from '../data/snippets.json';
import { STORAGE_KEYS } from '../storage/keys';
import { readJSON, writeJSON } from '../storage/storage';
import { getLocalDateKey } from '../utils/date';

const SnippetsContext = createContext(null);

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`Saved ${label} data must be a list. Please clear or repair the local data.`);
  }

  return value;
}

function assertRecord(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Saved ${label} data must be a record. Please clear or repair the local data.`);
  }

  return value;
}

export function SnippetsProvider({ children }) {
  const [snippets, setSnippets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = useRef([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const recentlyViewedRef = useRef([]);
  const userSnippetsRef = useRef([]);
  const [viewedSnippetIds, setViewedSnippetIds] = useState([]);
  const viewedSnippetIdsRef = useRef([]);
  const [activityDates, setActivityDates] = useState([]);
  const activityDatesRef = useRef([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const quizHistoryRef = useRef([]);
  const [snippetNotes, setSnippetNotes] = useState({});
  const snippetNotesRef = useRef({});
  const [recentSearches, setRecentSearches] = useState([]);
  const recentSearchesRef = useRef([]);
  const lastDeletedSnippetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        savedSnippets,
        savedFavorites,
        savedRecentlyViewed,
        savedViewedSnippetIds,
        savedActivityDates,
        savedQuizHistory,
        savedSnippetNotes,
        savedRecentSearches,
      ] = await Promise.all([
        readJSON(STORAGE_KEYS.userSnippets, []),
        readJSON(STORAGE_KEYS.favorites, []),
        readJSON(STORAGE_KEYS.recentlyViewed, []),
        readJSON(STORAGE_KEYS.viewedSnippetIds, []),
        readJSON(STORAGE_KEYS.activityDates, []),
        readJSON(STORAGE_KEYS.quizHistory, []),
        readJSON(STORAGE_KEYS.snippetNotes, {}),
        readJSON(STORAGE_KEYS.recentSearches, []),
      ]);
      const validUserSnippets = assertArray(savedSnippets, 'snippet');
      const validFavorites = assertArray(savedFavorites, 'favorites');
      const validRecentlyViewed = assertArray(savedRecentlyViewed, 'recently viewed');
      const validViewedSnippetIds = assertArray(savedViewedSnippetIds, 'viewed snippets');
      const validActivityDates = assertArray(savedActivityDates, 'activity dates');
      const validQuizHistory = assertArray(savedQuizHistory, 'quiz history');
      const validSnippetNotes = assertRecord(savedSnippetNotes, 'snippet notes');
      if (Object.entries(validSnippetNotes).some(
        ([snippetId, note]) => typeof snippetId !== 'string' || typeof note !== 'string' || note.length > 1000,
      )) {
        throw new Error('Saved snippet notes are invalid. Please clear or repair the local notes data.');
      }
      const validRecentSearches = assertArray(savedRecentSearches, 'recent searches');
      if (validRecentSearches.some((query) => typeof query !== 'string')) {
        throw new Error('Saved recent search data is invalid. Please clear or repair the local data.');
      }
      const mergedSnippets = new Map(bundledSnippets.map((snippet) => [snippet.id, snippet]));

      validUserSnippets.forEach((snippet) => {
        if (!snippet || typeof snippet.id !== 'string') {
          throw new Error('A saved snippet is missing its id. Please repair or clear the local snippet data.');
        }

        mergedSnippets.set(snippet.id, snippet);
      });

      setSnippets([...mergedSnippets.values()]);
      userSnippetsRef.current = validUserSnippets;
      setFavorites(validFavorites);
      favoritesRef.current = validFavorites;
      recentlyViewedRef.current = validRecentlyViewed;
      setRecentlyViewed(validRecentlyViewed);
      viewedSnippetIdsRef.current = validViewedSnippetIds;
      setViewedSnippetIds(validViewedSnippetIds);
      activityDatesRef.current = validActivityDates;
      setActivityDates(validActivityDates);
      quizHistoryRef.current = validQuizHistory;
      setQuizHistory(validQuizHistory);
      snippetNotesRef.current = validSnippetNotes;
      setSnippetNotes(validSnippetNotes);
      recentSearchesRef.current = validRecentSearches;
      setRecentSearches(validRecentSearches);
    } catch (loadError) {
      setError(loadError.message || 'CodeCrib could not load your local library.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordViewed = useCallback(async (snippetId) => {
    const next = [snippetId, ...recentlyViewedRef.current.filter((id) => id !== snippetId)].slice(0, 10);
    const nextViewedIds = viewedSnippetIdsRef.current.includes(snippetId)
      ? viewedSnippetIdsRef.current
      : [...viewedSnippetIdsRef.current, snippetId];
    const today = getLocalDateKey();
    const nextActivityDates = activityDatesRef.current.includes(today)
      ? activityDatesRef.current
      : [...activityDatesRef.current, today];
    recentlyViewedRef.current = next;
    viewedSnippetIdsRef.current = nextViewedIds;
    activityDatesRef.current = nextActivityDates;
    setRecentlyViewed(next);
    setViewedSnippetIds(nextViewedIds);
    setActivityDates(nextActivityDates);

    try {
      await Promise.all([
        writeJSON(STORAGE_KEYS.recentlyViewed, next),
        writeJSON(STORAGE_KEYS.viewedSnippetIds, nextViewedIds),
        writeJSON(STORAGE_KEYS.activityDates, nextActivityDates),
      ]);
    } catch (saveError) {
      setError(saveError.message || 'Could not save your recent activity.');
    }
  }, []);

  const saveSnippet = useCallback(async (snippetData, snippetId) => {
    const now = new Date().toISOString();
    const existing = snippetId
      ? userSnippetsRef.current.find((snippet) => snippet.id === snippetId)
      : null;

    if (snippetId && !existing) {
      throw new Error('This snippet is not editable.');
    }

    const snippet = {
      ...snippetData,
      id: existing?.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: existing?.createdAt || now.slice(0, 10),
      updatedAt: now,
      isUserCreated: true,
    };
    const nextUserSnippets = existing
      ? userSnippetsRef.current.map((item) => (item.id === snippet.id ? snippet : item))
      : [snippet, ...userSnippetsRef.current];

    await writeJSON(STORAGE_KEYS.userSnippets, nextUserSnippets);
    userSnippetsRef.current = nextUserSnippets;
    setSnippets((current) => {
      const next = new Map(current.map((item) => [item.id, item]));
      next.set(snippet.id, snippet);
      return [...next.values()];
    });

    return snippet;
  }, []);

  const deleteSnippet = useCallback(async (snippetId) => {
    const existing = userSnippetsRef.current.find((snippet) => snippet.id === snippetId);

    if (!existing) {
      throw new Error('Only snippets you created can be deleted.');
    }

    const nextUserSnippets = userSnippetsRef.current.filter((snippet) => snippet.id !== snippetId);
    const nextFavorites = favoritesRef.current.filter((id) => id !== snippetId);
    const nextRecentlyViewed = recentlyViewedRef.current.filter((id) => id !== snippetId);
    const nextNotes = { ...snippetNotesRef.current };
    const deletedNote = nextNotes[snippetId] || '';
    delete nextNotes[snippetId];
    await writeJSON(STORAGE_KEYS.userSnippets, nextUserSnippets);
    await Promise.all([
      writeJSON(STORAGE_KEYS.favorites, nextFavorites),
      writeJSON(STORAGE_KEYS.recentlyViewed, nextRecentlyViewed),
      writeJSON(STORAGE_KEYS.snippetNotes, nextNotes),
    ]);

    lastDeletedSnippetRef.current = {
      snippet: existing,
      wasFavorite: favoritesRef.current.includes(snippetId),
      recentlyViewedIndex: recentlyViewedRef.current.indexOf(snippetId),
      note: deletedNote,
    };
    userSnippetsRef.current = nextUserSnippets;
    favoritesRef.current = nextFavorites;
    recentlyViewedRef.current = nextRecentlyViewed;
    snippetNotesRef.current = nextNotes;
    setSnippets((current) => current.filter((snippet) => snippet.id !== snippetId));
    setFavorites(nextFavorites);
    setRecentlyViewed(nextRecentlyViewed);
    setSnippetNotes(nextNotes);
  }, []);

  const undoDeletedSnippet = useCallback(async () => {
    const deleted = lastDeletedSnippetRef.current;
    if (!deleted) return false;

    const nextUserSnippets = [deleted.snippet, ...userSnippetsRef.current.filter((snippet) => snippet.id !== deleted.snippet.id)];
    const nextFavorites = deleted.wasFavorite
      ? [...favoritesRef.current.filter((id) => id !== deleted.snippet.id), deleted.snippet.id]
      : favoritesRef.current;
    const nextRecentlyViewed = [...recentlyViewedRef.current];
    if (deleted.recentlyViewedIndex >= 0) {
      nextRecentlyViewed.splice(Math.min(deleted.recentlyViewedIndex, nextRecentlyViewed.length), 0, deleted.snippet.id);
    }
    nextRecentlyViewed.splice(10);
    const nextNotes = deleted.note
      ? { ...snippetNotesRef.current, [deleted.snippet.id]: deleted.note }
      : snippetNotesRef.current;

    await Promise.all([
      writeJSON(STORAGE_KEYS.userSnippets, nextUserSnippets),
      writeJSON(STORAGE_KEYS.favorites, nextFavorites),
      writeJSON(STORAGE_KEYS.recentlyViewed, nextRecentlyViewed),
      writeJSON(STORAGE_KEYS.snippetNotes, nextNotes),
    ]);

    userSnippetsRef.current = nextUserSnippets;
    favoritesRef.current = nextFavorites;
    recentlyViewedRef.current = nextRecentlyViewed;
    snippetNotesRef.current = nextNotes;
    setSnippets((current) => [deleted.snippet, ...current.filter((snippet) => snippet.id !== deleted.snippet.id)]);
    setFavorites(nextFavorites);
    setRecentlyViewed(nextRecentlyViewed);
    setSnippetNotes(nextNotes);
    lastDeletedSnippetRef.current = null;
    return true;
  }, []);

  const saveSnippetNote = useCallback(async (snippetId, note) => {
    if (!snippets.some((snippet) => snippet.id === snippetId)) {
      throw new Error('This snippet is no longer available for notes.');
    }
    if (typeof note !== 'string' || note.length > 1000) {
      throw new Error('Notes must be 1,000 characters or fewer.');
    }

    const nextNotes = { ...snippetNotesRef.current };
    if (note.trim()) {
      nextNotes[snippetId] = note.trim();
    } else {
      delete nextNotes[snippetId];
    }
    await writeJSON(STORAGE_KEYS.snippetNotes, nextNotes);
    snippetNotesRef.current = nextNotes;
    setSnippetNotes(nextNotes);
  }, [snippets]);

  const recordSearch = useCallback(async (query) => {
    const normalizedQuery = query.trim().replace(/\s+/g, ' ');
    if (!normalizedQuery) return;

    const nextSearches = [
      normalizedQuery,
      ...recentSearchesRef.current.filter((saved) => saved.toLowerCase() !== normalizedQuery.toLowerCase()),
    ].slice(0, 5);
    await writeJSON(STORAGE_KEYS.recentSearches, nextSearches);
    recentSearchesRef.current = nextSearches;
    setRecentSearches(nextSearches);
  }, []);

  const clearRecentSearches = useCallback(async () => {
    await writeJSON(STORAGE_KEYS.recentSearches, []);
    recentSearchesRef.current = [];
    setRecentSearches([]);
  }, []);

  const toggleFavorite = useCallback(async (snippetId) => {
    const nextFavorites = favoritesRef.current.includes(snippetId)
      ? favoritesRef.current.filter((id) => id !== snippetId)
      : [...favoritesRef.current, snippetId];

    await writeJSON(STORAGE_KEYS.favorites, nextFavorites);
    favoritesRef.current = nextFavorites;
    setFavorites(nextFavorites);
    return nextFavorites.includes(snippetId);
  }, []);

  const saveQuizResult = useCallback(async (result) => {
    const today = getLocalDateKey();
    const nextHistory = [
      { ...result, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date: today },
      ...quizHistoryRef.current,
    ].slice(0, 50);
    const nextActivityDates = activityDatesRef.current.includes(today)
      ? activityDatesRef.current
      : [...activityDatesRef.current, today];

    await Promise.all([
      writeJSON(STORAGE_KEYS.quizHistory, nextHistory),
      writeJSON(STORAGE_KEYS.activityDates, nextActivityDates),
    ]);

    quizHistoryRef.current = nextHistory;
    activityDatesRef.current = nextActivityDates;
    setQuizHistory(nextHistory);
    setActivityDates(nextActivityDates);
    return nextHistory[0];
  }, []);

  const clearFavorites = useCallback(async () => {
    await writeJSON(STORAGE_KEYS.favorites, []);
    favoritesRef.current = [];
    setFavorites([]);
  }, []);

  const clearQuizHistory = useCallback(async () => {
    await writeJSON(STORAGE_KEYS.quizHistory, []);
    quizHistoryRef.current = [];
    setQuizHistory([]);
  }, []);

  const resetUserData = useCallback(async () => {
    await Promise.all([
      writeJSON(STORAGE_KEYS.userSnippets, []),
      writeJSON(STORAGE_KEYS.favorites, []),
      writeJSON(STORAGE_KEYS.recentlyViewed, []),
      writeJSON(STORAGE_KEYS.viewedSnippetIds, []),
      writeJSON(STORAGE_KEYS.activityDates, []),
      writeJSON(STORAGE_KEYS.quizHistory, []),
      writeJSON(STORAGE_KEYS.snippetNotes, {}),
      writeJSON(STORAGE_KEYS.recentSearches, []),
    ]);

    userSnippetsRef.current = [];
    favoritesRef.current = [];
    recentlyViewedRef.current = [];
    viewedSnippetIdsRef.current = [];
    activityDatesRef.current = [];
    quizHistoryRef.current = [];
    snippetNotesRef.current = {};
    recentSearchesRef.current = [];
    lastDeletedSnippetRef.current = null;
    setSnippets(bundledSnippets);
    setFavorites([]);
    setRecentlyViewed([]);
    setViewedSnippetIds([]);
    setActivityDates([]);
    setQuizHistory([]);
    setSnippetNotes({});
    setRecentSearches([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      snippets,
      setSnippets,
      favorites,
      setFavorites,
      recentlyViewed,
      viewedSnippetIds,
      activityDates,
      quizHistory,
      snippetNotes,
      recentSearches,
      recordViewed,
      saveSnippet,
      deleteSnippet,
      undoDeletedSnippet,
      saveSnippetNote,
      recordSearch,
      clearRecentSearches,
      toggleFavorite,
      saveQuizResult,
      clearFavorites,
      clearQuizHistory,
      resetUserData,
      isLoading,
      error,
      refresh,
      setError,
    }),
    [
      snippets,
      favorites,
      recentlyViewed,
      viewedSnippetIds,
      activityDates,
      quizHistory,
      snippetNotes,
      recentSearches,
      recordViewed,
      saveSnippet,
      deleteSnippet,
      undoDeletedSnippet,
      saveSnippetNote,
      recordSearch,
      clearRecentSearches,
      toggleFavorite,
      saveQuizResult,
      clearFavorites,
      clearQuizHistory,
      resetUserData,
      isLoading,
      error,
      refresh,
    ],
  );

  return <SnippetsContext.Provider value={value}>{children}</SnippetsContext.Provider>;
}

export function useSnippets() {
  const context = useContext(SnippetsContext);

  if (!context) {
    throw new Error('useSnippets must be used within a SnippetsProvider');
  }

  return context;
}
