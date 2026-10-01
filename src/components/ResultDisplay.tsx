import React from 'react';
import { TestResult } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { RotateCcw, Share2, Trophy, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultDisplayProps {
  result: TestResult;
  onRetry: () => void;
  onNewTest: () => void;
  isNewPersonalBest?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onRetry, onNewTest, isNewPersonalBest }) => {
  const chartData = result.wpmHistory.map((point, index) => ({
    time: Math.round(point.time),
    wpm: point.wpm,
    accuracy: point.accuracy,
  }));

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      {isNewPersonalBest && (
        <div className="flex items-center justify-center gap-2 mb-6 text-yellow-400">
          <Trophy className="w-6 h-6" />
          <span className="text-xl font-bold">New Personal Best!</span>
          <Trophy className="w-6 h-6" />
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4 bg-gray-800/50 rounded-xl">
          <div className="text-4xl font-bold text-white">{result.wpm}</div>
          <div className="text-sm text-gray-400 mt-1">WPM</div>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded-xl">
          <div className="text-4xl font-bold text-white">{result.accuracy}%</div>
          <div className="text-sm text-gray-400 mt-1">Accuracy</div>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded-xl">
          <div className="text-4xl font-bold text-white">{result.rawWpm}</div>
          <div className="text-sm text-gray-400 mt-1">Raw WPM</div>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded-xl">
          <div className="text-4xl font-bold text-white">{result.consistency}%</div>
          <div className="text-sm text-gray-400 mt-1">Consistency</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="mb-8 p-4 bg-gray-800/30 rounded-xl">
          <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="wpm" stroke="#eab308" fill="url(#wpmGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatItem label="Total Characters" value={result.totalChars} />
        <StatItem label="Correct" value={result.correctChars} color="text-green-400" />
        <StatItem label="Incorrect" value={result.incorrectChars} color="text-red-400" />
        <StatItem label="Total Keystrokes" value={result.totalKeystrokes} />
        <StatItem label="Correct Keystrokes" value={result.correctKeystrokes} color="text-green-400" />
        <StatItem label="Incorrect Keystrokes" value={result.incorrectKeystrokes} color="text-red-400" />
        <StatItem label="Corrected Errors" value={result.correctedErrors} color="text-yellow-400" />
        <StatItem label="Uncorrected Errors" value={result.uncorrectedErrors} color="text-red-400" />
        <StatItem label="Duration" value={`${result.duration.toFixed(1)}s`} />
        <StatItem label="Mode" value={result.mode} />
        <StatItem label="Language" value={result.language} />
        <StatItem label="Difficulty" value={result.difficulty} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
        <button
          onClick={onNewTest}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-lg transition-colors"
        >
          New Test
        </button>
        <ShareButton result={result} />
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-white' }) => (
  <div className="p-3 bg-gray-800/30 rounded-lg">
    <div className={`text-lg font-medium ${color}`}>{value}</div>
    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
  </div>
);

const ShareButton: React.FC<{ result: TestResult }> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `⌨️ TypeFlow Result\n🏎️ ${result.wpm} WPM\n🎯 ${result.accuracy}% accuracy\n⏱️ ${result.duration.toFixed(1)}s\n📝 ${result.mode} • ${result.language} • ${result.difficulty}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
};
