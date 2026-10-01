import React, { useState, useMemo, useCallback } from 'react';
import { TypingArea } from '../components/TypingArea';
import { ResultDisplay } from '../components/ResultDisplay';
import { TestConfig, TestResult, DailyChallengeResult } from '../types';
import { useAppStore } from '../stores/appStore';
import { generateDailyChallenge, calculateScore, getTodayString } from '../utils/calculations';
import { Target, Flame, Trophy, Calendar, Lock } from 'lucide-react';

export const DailyChallengePage: React.FC = () => {
  const challenge = useMemo(() => generateDailyChallenge(new Date()), []);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [testKey, setTestKey] = useState(0);
  const { addDailyChallengeResult, dailyChallengeResults, user, isAuthenticated } = useAppStore();

  const todayString = getTodayString();
  const todayResult = dailyChallengeResults.find(r => r.date === todayString);

  const config: TestConfig = {
    mode: challenge.mode,
    duration: challenge.duration,
    wordCount: challenge.wordCount,
    language: challenge.language,
    difficulty: challenge.difficulty,
    customText: challenge.text,
  };

  const handleComplete = useCallback((r: TestResult) => {
    setResult(r);
    setShowResult(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!result) return;
    const score = calculateScore(result.wpm, result.accuracy, result.consistency, challenge.multiplier);
    const challengeResult: DailyChallengeResult = {
      date: todayString,
      wpm: result.wpm,
      accuracy: result.accuracy,
      rawWpm: result.rawWpm,
      score,
      duration: result.duration,
      errors: result.incorrectChars,
      timestamp: Date.now(),
    };
    addDailyChallengeResult(challengeResult);
    setHasSubmitted(true);
  }, [result, challenge, todayString, addDailyChallengeResult]);

  const handleRetry = useCallback(() => {
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  }, []);

  if (showResult && result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Daily Challenge Result</h2>
            <p className="text-gray-400 mt-1">{todayString} • {challenge.specialRule || `${challenge.mode} ${challenge.language}`}</p>
          </div>
          <ResultDisplay result={result} onRetry={handleRetry} onNewTest={handleRetry} />
          {!hasSubmitted && (
            <div className="text-center mt-6">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors text-lg"
              >
                Submit Official Result
              </button>
              <p className="text-sm text-gray-500 mt-2">Only your official submission counts for the leaderboard</p>
            </div>
          )}
          {hasSubmitted && (
            <div className="text-center mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-xl">
              <p className="text-green-400 font-medium">✓ Result submitted to leaderboard!</p>
              <p className="text-gray-400 text-sm mt-1">
                Score: {calculateScore(result.wpm, result.accuracy, result.consistency, challenge.multiplier)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      {/* Challenge Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
                <p className="text-gray-400 text-sm">{todayString}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && user.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">{user.currentStreak}</span>
                </div>
              )}
              <div className="text-right">
                <div className="text-sm text-gray-400">Multiplier</div>
                <div className="text-xl font-bold text-yellow-400">x{challenge.multiplier}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-500">Mode: </span>
              <span className="text-white capitalize">{challenge.mode}</span>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-500">Language: </span>
              <span className="text-white capitalize">{challenge.language}</span>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-500">Difficulty: </span>
              <span className="text-white capitalize">{challenge.difficulty}</span>
            </div>
            {challenge.duration > 0 && (
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <span className="text-gray-500">Duration: </span>
                <span className="text-white">{challenge.duration}s</span>
              </div>
            )}
          </div>

          {challenge.specialRule && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">⚡ {challenge.specialRule}</p>
            </div>
          )}

          {todayResult && (
            <div className="mt-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <p className="text-green-400 text-sm">
                ✓ You've already submitted today! WPM: {todayResult.wpm} | Score: {todayResult.score}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Typing Area */}
      <TypingArea key={testKey} config={config} onComplete={handleComplete} isDailyChallenge />
    </div>
  );
};
