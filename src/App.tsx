import { useState } from 'react';
import { Icon } from '@/components/icon';
import { useApplyTheme } from '@/hooks/use-apply-theme';
import { EssentialsScreen } from '@/features/essentials/essentials-screen';
import { SettingsOverlay } from '@/features/essentials/settings-overlay';
import { useEssentialsStore } from '@/store/essentials-store';

export function App() {
  useApplyTheme();
  const theme = useEssentialsStore((state) => state.settings.theme);
  const setTheme = useEssentialsStore((state) => state.setTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="e-root">
      {/* Two nearly-invisible top-corner controls; everything else is the page. */}
      <button
        className="e-corner e-corner-settings"
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Settings"
      >
        <Icon name="sliders" size={18} />
      </button>
      <button
        className="e-corner e-corner-theme"
        type="button"
        onClick={() => setTheme(theme === 'paper' ? 'dark' : 'paper')}
        aria-label="Toggle theme"
      >
        <Icon name={theme === 'paper' ? 'moon' : 'sun'} size={18} />
      </button>

      <main className="e-col">
        <EssentialsScreen />
      </main>

      {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
