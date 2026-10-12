import { useCallback, useEffect, useRef, useState } from 'react';

/** Same-tab sync event so multiple components using the same key stay in sync */
const SYNC_EVENT = 'crm-local-storage-sync';

/**
 * Persisted state helper backed by localStorage.
 * Falls back to in-memory state when storage is unavailable (private mode, SSR).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      const parsed = JSON.parse(raw) as T;
      // Merge object defaults so newly added settings keys are not lost
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        initialValue &&
        typeof initialValue === 'object' &&
        !Array.isArray(initialValue)
      ) {
        return { ...(initialValue as object), ...(parsed as object) } as T;
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const update = useCallback(
    (updater: React.SetStateAction<T>) => {
      const prev = valueRef.current;
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      valueRef.current = next;
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage unavailable — keep working in-memory
      }
      try {
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, value: next } }));
      } catch {
        // ignore
      }
    },
    [key]
  );

  // Keep in sync with other hook instances using the same key
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail && detail.key === key) {
        valueRef.current = detail.value;
        setValue(detail.value);
      }
    };
    window.addEventListener(SYNC_EVENT, handler as EventListener);
    return () => window.removeEventListener(SYNC_EVENT, handler as EventListener);
  }, [key]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    update(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, update]);

  return [value, update, reset] as const;
}
