import React, { useState, useCallback } from 'react';
import { TypingArea } from '../components/TypingArea';
import { ResultDisplay } from '../components/ResultDisplay';
import { TestConfig, TestResult } from '../types';
import { useAppStore } from '../stores/appStore';
import { generatePracticeText } from '../utils/calculations';
import { Zap, Target, BookOpen, Hash, Code, Quote, Brain, PenTool } from 'lucide-react';

const categories = [
  { id: 'speed', name: 'Speed', description: 'Common words, fast pace', icon: Zap },
  { id: 'accuracy', name: 'Accuracy', description: 'Focus on precision', icon: Target },
  { id: 'difficult', name: 'Difficult Words', description: 'Tricky vocabulary', icon: Brain },
  { id: 'numbers', name: 'Numbers', description: 'Digits and decimals', icon: Hash },
  { id: 'punctuation', name: 'Punctuation', description: 'Special characters', icon: PenTool },
  { id: 'programming', name: 'Code', description: 'Programming snippets', icon: Code },
  { id: 'quotes', name: 'Quotes', description: 'Famous quotes', icon: Quote },
  { id: 'weak', name: 'Weak Words', description: 'Your mistakes', icon: BookOpen },
];

export const PracticePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [testKey, setTestKey] = useState(0);
  const { weakWords } = useAppStore();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  };

  const getPracticeConfig = (): TestConfig => {
    if (!selectedCategory) {
      return { mode: 'words', duration: 0, wordCount: 25, language: 'english', difficulty: 'normal' };
    }

    let text = '';
    if (selectedCategory === 'weak' && weakWords.length > 0) {
      text = weakWords.sort((a, b) => b.mistakes - a.mistakes).slice(0, 30).map(w => w.word).join(' ');
    } else {
      text = generatePracticeText(selectedCategory);
    }

    return {
      mode: 'custom',
      duration: 0,
      wordCount: 0,
      language: 'english',
      difficulty: 'normal',
      customText: text,
    };
  };

  const handleComplete = useCallback((r: TestResult) => {
    setResult(r);
    setShowResult(true);
  }, []);

  const handleRetry = useCallback(() => {
    setShowResult(false);
    setResult(null);
    setTestKey(prev => prev + 1);
  }, []);

  if (showResult && result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <ResultDisplay result={result} onRetry={handleRetry} onNewTest={() => { setShowResult(false); setResult(null); setSelectedCategory(null); }} />
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white capitalize">{selectedCategory} Practice</h2>
              <p className="text-gray-400 text-sm">{categories.find(c => c.id === selectedCategory)?.description}</p>
            </div>
            <button
              onClick={() => { setSelectedCategory(null); setShowResult(false); setResult(null); }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              ← Back to categories
            </button>
          </div>
        </div>
        <TypingArea key={testKey} config={getPracticeConfig()} onComplete={handleComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center p-4 pt-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Practice Mode</h1>
          <p className="text-gray-400">Choose a category to improve specific skills</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isDisabled = cat.id === 'weak' && weakWords.length === 0;
            return (
              <button
                key={cat.id}
                onClick={() => !isDisabled && handleCategorySelect(cat.id)}
                disabled={isDisabled}
                className={`p-6 rounded-xl border text-left transition-all ${
                  isDisabled
                    ? 'bg-gray-900/30 border-gray-800 opacity-50 cursor-not-allowed'
                    : 'bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 hover:bg-gray-900/80'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${isDisabled ? 'text-gray-600' : 'text-yellow-400'}`} />
                <h3 className="text-white font-medium mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-400">{cat.description}</p>
                {isDisabled && (
                  <p className="text-xs text-gray-600 mt-2">Make some mistakes first to unlock</p>
                )}
              </button>
            );
          })}
        </div>

        {weakWords.length > 0 && (
          <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <h3 className="text-white font-medium mb-3">Your Weak Words ({weakWords.length})</h3>
            <div className="flex flex-wrap gap-2">
              {weakWords.sort((a, b) => b.mistakes - a.mistakes).slice(0, 20).map(w => (
                <span key={w.word} className="px-2 py-1 bg-red-900/20 border border-red-800/50 rounded text-sm text-red-300">
                  {w.word} ({w.mistakes})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
