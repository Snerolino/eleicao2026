'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme-preference';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Modo escuro"
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-skeleton)] transition-colors hover:border-[var(--color-institutional)] focus-visible:outline-2 focus-visible:outline-[var(--color-institutional)] focus-visible:outline-offset-2"
      role="switch"
      aria-checked={theme === 'dark'}
    >
      {/* thumb */}
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs shadow-sm transition-transform ${
          theme === 'dark' ? 'translate-x-[1.375rem]' : 'translate-x-[0.188rem]'
        }`}
        aria-hidden="true"
      >
        {theme === 'light' ? (
          /* sun */
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-amber-600">
            <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1Zm0 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-2a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 14 8Zm-10.5 0A.75.75 0 0 1 2.75 8h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3.5 8Zm.97-3.53a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06L5.53 4.47a.75.75 0 0 1-1.06 0Zm7.06 0a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM4.47 11.47a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm7.06 0a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM8 12.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12.5Z" />
          </svg>
        ) : (
          /* moon */
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-indigo-500">
            <path d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
