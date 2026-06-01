import { useEffect } from 'react';
import { useEssentialsStore } from '@/store/essentials-store';

/** Reflects the theme and accent onto <html> so the palette swaps everywhere. */
export function useApplyTheme(): void {
  const theme = useEssentialsStore((state) => state.settings.theme);
  const accent = useEssentialsStore((state) => state.settings.accent);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--accent', accent);
  }, [theme, accent]);
}
