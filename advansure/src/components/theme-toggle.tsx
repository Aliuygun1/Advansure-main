'use client';

import { useState, useEffect } from 'react';
import { Icon } from './icons';

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('adv-theme', theme);
  } catch {
    // localStorage not available (SSR guard handled by useEffect)
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('adv-theme') as Theme | null;
    const preferred: Theme =
      saved ??
      (window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark');
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      aria-label={theme === 'dark' ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren'}
      onClick={toggle}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        color: 'var(--text)',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        transition: 'background .15s, transform .12s',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
    </button>
  );
}
