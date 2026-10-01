import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';
import { DailyChallengePage } from './pages/DailyChallengePage';
import { MultiplayerPage } from './pages/MultiplayerPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PracticePage } from './pages/PracticePage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { AchievementToast } from './components/AchievementToast';
import { useAppStore } from './stores/appStore';

function App() {
  const settings = useAppStore(s => s.settings);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    switch (settings.theme) {
      case 'light':
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
        break;
      case 'midnight':
        root.classList.add('midnight-theme');
        root.classList.remove('light-theme');
        break;
      default:
        root.classList.remove('light-theme', 'midnight-theme');
    }
  }, [settings.theme]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navigation />
        <main className="min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/daily" element={<DailyChallengePage />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
          </div>
          <Footer />
        </main>
        <AchievementToast />
      </div>
    </HashRouter>
  );
}

export default App;
