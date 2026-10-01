import React, { useState, useCallback } from 'react';
import { TypingArea } from '../components/TypingArea';
import { ResultDisplay } from '../components/ResultDisplay';
import { CustomTextModal } from '../components/CustomTextModal';
import { TestConfig, TestResult, TestMode, Language, Difficulty } from '../types';
import { Clock, Hash, BookOpen, PenTool } from 'lucide-react';

export const TestPage: React.FC = () => {
  const [config, setConfig] = useState<TestConfig>({
    mode: 'time',
    duration: 30,
    wordCount: 25,
    language: 'english',
    difficulty: 'normal',
  });
  const [result, setResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [testKey, setTestKey] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleComplete = useCallback((r: TestResult) => {
    setResult(r);
    setShowResult(true);
  }, []);

  const handleRetry = useCallback(() => {
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  }, []);

  const handleNewTest = useCallback(() => {
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  }, []);

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
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
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

          <select
            value={config.language}
            onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value as Language }))}
            className="bg-gray-800/50 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-yellow-500 focus:outline-none"
          >
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

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

      <TypingArea key={testKey} config={config} onComplete={handleComplete} />

      <CustomTextModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSubmit={handleCustomText}
      />
    </div>
  );
};
