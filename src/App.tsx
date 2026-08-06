import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import MainMenuScreen from './components/MainMenuScreen';
import SettingsScreen from './components/SettingsScreen';
import ScorekeeperScreen from './components/ScorekeeperScreen';
import DefaultsScreen from './components/DefaultsScreen';
import ScheduleScreen from './components/ScheduleScreen';
import { Screen, Player } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [scheduledGameData, setScheduledGameData] = useState<{
    homeTeam: string;
    awayTeam: string;
    homeRoster?: Player[];
    awayRoster?: Player[];
  } | null>(null);

  const handleStartScheduledGame = (homeTeam: string, awayTeam: string, homeRoster?: Player[], awayRoster?: Player[]) => {
    setScheduledGameData({ homeTeam, awayTeam, homeRoster, awayRoster });
    setCurrentScreen('settings');
  };

  const handleNewGame = () => {
    setScheduledGameData(null);
    setCurrentScreen('settings');
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-background font-body overflow-x-hidden selection:bg-tertiary selection:text-on-tertiary">
      {currentScreen === 'splash' && <LoginScreen onLogin={() => setCurrentScreen('main-menu')} />}
      {currentScreen === 'main-menu' && (
        <MainMenuScreen
          onNewGame={handleNewGame}
          onLogout={() => setCurrentScreen('splash')}
          onConfigureDefaults={() => setCurrentScreen('defaults')}
          onOpenSchedule={() => setCurrentScreen('schedule')}
        />
      )}
      {currentScreen === 'schedule' && (
        <ScheduleScreen
          onBack={() => setCurrentScreen('main-menu')}
          onStartGame={handleStartScheduledGame}
        />
      )}
      {currentScreen === 'settings' && (
        <SettingsScreen
          scheduledGameData={scheduledGameData}
          onStart={() => setCurrentScreen('scorekeeper')}
          onBack={() => setCurrentScreen('main-menu')}
        />
      )}
      {currentScreen === 'defaults' && <DefaultsScreen onBack={() => setCurrentScreen('main-menu')} />}
      {currentScreen === 'scorekeeper' && <ScorekeeperScreen onBack={() => setCurrentScreen('settings')} />}
    </div>
  );
}
