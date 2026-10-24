'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';

export type Theme = 'dark' | 'light';

let memoryThemeFallback: Theme | null = null;

function applyThemeToDocument(newTheme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('pannello-theme-change', callback);
  let mql: MediaQueryList | null = null;
  try {
    if (typeof window.matchMedia === 'function') {
      mql = window.matchMedia('(prefers-color-scheme: light)');
      mql.addEventListener('change', callback);
    }
  } catch {
    mql = null;
  }
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('pannello-theme-change', callback);
    try {
      mql?.removeEventListener('change', callback);
    } catch {
      // Ignore legacy browser listener cleanup errors
    }
  };
}

function getSnapshot(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem('pannello_theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    if (memoryThemeFallback) return memoryThemeFallback;
  }
  if (memoryThemeFallback) return memoryThemeFallback;
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // Default to dark theme if matchMedia is unavailable
  }
  return 'dark';
}

function getServerSnapshot(): Theme {
  return 'dark';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    memoryThemeFallback = nextTheme;
    try {
      localStorage.setItem('pannello_theme', nextTheme);
    } catch {
      // Restricted WebView or Private Browsing: memoryThemeFallback preserves session state
    }
    applyThemeToDocument(nextTheme);
    window.dispatchEvent(new Event('pannello-theme-change'));
  }, [theme]);

  return { theme, toggleTheme, mounted: true };
}
