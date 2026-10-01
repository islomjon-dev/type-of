import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TypingArea } from '../components/TypingArea';
import { ResultDisplay } from '../components/ResultDisplay';
import { CustomTextModal } from '../components/CustomTextModal';
import { TestConfig, TestResult, TestMode, Language, Difficulty } from '../types';
import { useAppStore } from '../stores/appStore';
import { generateDailyChallenge, getTodayString } from '../utils/calculations';
import { Clock, Hash, BookOpen, PenTool, Target, Flame, TrendingUp, Keyboard, Users, BarChart3 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [config, setConfig] = useState<TestConfig>({
    mode: 'time',
    duration: 30,
    wordCount: 25,
    language: 'english',
    difficulty: 'normal',
  });
  const [result, setResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [testKey, setTestKey] = useState(0);
  const { user, results, isAuthenticated, dailyChallengeResults } = useAppStore();

  const todayChallenge = useMemo(() => generateDailyChallenge(new Date()), []);

  const handleComplete = (r: TestResult) => {
    setResult(r);
    setShowResult(true);
  };

  const handleRetry = () => {
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  };

  const handleNewTest = () => {
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  };

  const handleCustomText = (text: string) => {
    setConfig(prev => ({ ...prev, mode: 'custom', customText: text }));
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  };

  const modes: { value: TestMode; label: string; icon: React.ReactNode }[] = [
    { value: 'time', label: 'time', icon: <Clock className="w-4 h-4" /> },
    { value: 'words', label: 'words', icon: <Hash className="w-4 h-4" /> },
    { value: 'quote', label: 'quote', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'custom', label: 'custom', icon: <PenTool className="w-4 h-4" /> },
  ];

  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];
  const languages: { value: Language; label: string }[] = [
    { value: 'english', label: 'English' },
    { value: 'uzbek', label: "O'zbek" },
    { value: 'russian', label: 'Русский' },
  ];
  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'normal', label: 'Normal' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
  ];

  if (showResult && result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <ResultDisplay result={result} onRetry={handleRetry} onNewTest={handleNewTest} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Keyboard className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">TypeFlow</h1>
        </div>
        <p className="text-gray-400">A minimal, modern typing test. Start typing to begin.</p>
      </div>

      {/* Config Bar */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => {
                  if (mode.value === 'custom') {
                    setShowCustomModal(true);
                  } else {
                    setConfig(prev => ({ ...prev, mode: mode.value }));
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  config.mode === mode.value
                    ? 'bg-yellow-500 text-gray-900 font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>

          {/* Duration/Word Count */}
          {config.mode === 'time' && (
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              {timeOptions.map(t => (
                <button
                  key={t}
                  onClick={() => setConfig(prev => ({ ...prev, duration: t }))}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    config.duration === t
                      ? 'bg-gray-700 text-white font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          )}
          {config.mode === 'words' && (
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              {wordOptions.map(w => (
                <button
                  key={w}
                  onClick={() => setConfig(prev => ({ ...prev, wordCount: w }))}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    config.wordCount === w
                      ? 'bg-gray-700 text-white font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {/* Language */}
          <select
            value={config.language}
            onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value as Language }))}
            className="bg-gray-800/50 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-yellow-500 focus:outline-none"
          >
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={config.difficulty}
            onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
            className="bg-gray-800/50 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-yellow-500 focus:outline-none"
          >
            {difficulties.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Typing Area */}
      <TypingArea key={testKey} config={config} onComplete={handleComplete} />

      {/* Feature Cards */}
      <div className="w-full max-w-4xl mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Challenge Preview */}
        <Link
          to="/daily"
          className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-yellow-500/50 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-medium text-sm">Daily Challenge</h3>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">
            {todayChallenge.specialRule || `${todayChallenge.mode} • ${todayChallenge.language}`}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {todayChallenge.difficulty} • x{todayChallenge.multiplier}
          </p>
        </Link>

        {/* Multiplayer */}
        <Link
          to="/multiplayer"
          className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium text-sm">Multiplayer</h3>
          </div>
          <p className="text-xs text-gray-400">Race against others in real-time</p>
        </Link>

        {/* Stats */}
        <Link
          to="/statistics"
          className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-green-500/50 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-medium text-sm">Statistics</h3>
          </div>
          <p className="text-xs text-gray-400">Track your progress over time</p>
        </Link>

        {/* User Stats or Practice */}
        {isAuthenticated && user ? (
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium text-sm">Your Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="text-gray-500">Tests: </span>
                <span className="text-white">{user.totalTests}</span>
              </div>
              <div>
                <span className="text-gray-500">Best: </span>
                <span className="text-yellow-400">{user.bestWpm}wpm</span>
              </div>
              <div>
                <span className="text-gray-500">Avg: </span>
                <span className="text-white">{user.averageWpm}wpm</span>
              </div>
              <div>
                <span className="text-gray-500">Acc: </span>
                <span className="text-white">{user.bestAccuracy}%</span>
              </div>
            </div>
            {user.currentStreak > 0 && (
              <div className="flex items-center gap-1 mt-2 text-orange-400">
                <Flame className="w-3 h-3" />
                <span className="text-xs">{user.currentStreak} day streak</span>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/practice"
            className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <PenTool className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium text-sm">Practice</h3>
            </div>
            <p className="text-xs text-gray-400">Improve specific skills</p>
          </Link>
        )}
      </div>

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="w-full max-w-4xl mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Recent Results</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {results.slice(-8).reverse().map((r, i) => (
              <div key={i} className="flex-shrink-0 px-3 py-2 bg-gray-800/50 rounded-lg text-center min-w-[80px]">
                <div className="text-lg font-bold text-white">{r.wpm}</div>
                <div className="text-xs text-gray-500">{r.accuracy}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CustomTextModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSubmit={handleCustomText}
      />
    </div>
  );
};
