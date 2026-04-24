import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { FloatingThemeToggle } from './components/FloatingThemeToggle';
import { TitleScreen } from './screens/TitleScreen';
import { BugHuntScreen } from './screens/BugHuntScreen';
import { TypeRaceScreen } from './screens/TypeRaceScreen';
import { EndOfRunScreen } from './screens/EndOfRunScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StatsScreen } from './screens/StatsScreen';

export function App() {
  const route = useGameStore((s) => s.route);
  const theme = useGameStore((s) => s.theme);
  const crt = useGameStore((s) => s.crt);
  const updateSettings = useGameStore((s) => s.updateSettings);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      {route === 'title' && <TitleScreen />}
      {route === 'bughunt' && <BugHuntScreen />}
      {route === 'typerace' && <TypeRaceScreen />}
      {route === 'endrun' && <EndOfRunScreen />}
      {route === 'settings' && <SettingsScreen />}
      {route === 'stats' && <StatsScreen />}

      <FloatingThemeToggle
        theme={theme}
        onToggle={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
      />

      {crt && <div aria-hidden className="crt-overlay" />}
    </div>
  );
}
