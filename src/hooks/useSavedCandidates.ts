import { useCallback, useEffect, useState, useMemo } from 'react';

const STORAGE_KEY = 'votopraquem:saved-candidates:v1';

function readSavedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((value): value is string => typeof value === 'string'))];
  } catch {
    return [];
  }
}

export function useSavedCandidates(validIds: Set<string>) {
  const [savedIds, setSavedIds] = useState<string[]>(() => (typeof window === 'undefined' ? [] : readSavedIds()));

  useEffect(() => {
    setSavedIds((current) => current.filter((id) => validIds.has(id)));
  }, [validIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Storage is an optional convenience; the page remains usable when unavailable.
    }
  }, [savedIds]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((current) => (current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]));
  }, []);

  const clearSaved = useCallback(() => setSavedIds([]), []);

  // ⚡ Bolt Optimization: Memoize the Set creation to avoid O(N) operations on every render
  // and maintain referential stability for downstream components.
  // Expected Impact: Reduces unnecessary re-renders in components depending on `savedSet`
  // and eliminates the overhead of recreating the Set on every single hook invocation.
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  return { savedIds, savedSet, toggleSaved, clearSaved };
}
