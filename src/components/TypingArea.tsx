import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { TestConfig, TestResult } from '../types';
import { useAppStore } from '../stores/appStore';
import { formatTime } from '../utils/calculations';

interface TypingAreaProps {
  config: TestConfig;
  onComplete?: (result: TestResult) => void;
  isDailyChallenge?: boolean;
}

export const TypingArea: React.FC<TypingAreaProps> = ({ config, onComplete, isDailyChallenge }) => {
  const { state, handleKeyPress, initializeText, getResult } = useTypingEngine(config);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(true);
  const settings = useAppStore(s => s.settings);
  const addResult = useAppStore(s => s.addResult);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        initializeText();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        initializeText();
        return;
      }
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, initializeText]);

  useEffect(() => {
    if (state.isFinished && onComplete) {
      const result = getResult();
      if (result) {
        if (!isDailyChallenge) {
          addResult(result);
        }
        onComplete(result);
      }
    }
  }, [state.isFinished]);

  // Auto-scroll text
  useEffect(() => {
    if (textRef.current) {
      const activeChar = textRef.current.querySelector('[data-active="true"]');
      if (activeChar) {
        activeChar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [state.currentIndex]);

  const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
  const [displayElapsed, setDisplayElapsed] = useState(0);

  useEffect(() => {
    if (!state.isRunning || state.isFinished) return;
    const interval = setInterval(() => {
      if (state.startTime) {
        setDisplayElapsed((Date.now() - state.startTime) / 1000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [state.isRunning, state.isFinished, state.startTime]);

  const remainingTime = config.mode === 'time' ? Math.max(0, config.duration - displayElapsed) : displayElapsed;

  const renderText = () => {
    return state.text.split('').map((char, index) => {
      let className = 'transition-colors duration-75 ';

      if (index < state.currentIndex) {
        // Already typed
        if (state.typedChars[index] === char) {
          className += 'text-green-400';
        } else {
          className += 'text-red-400 bg-red-400/10';
        }
      } else if (index === state.currentIndex) {
        // Current character
        className += 'text-white bg-white/10 rounded';
      } else {
        // Not yet typed
        className += 'text-gray-500';
      }

      return (
        <span
          key={index}
          className={className}
          data-active={index === state.currentIndex}
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {settings.showWpm && (
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{state.wpm}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">wpm</div>
          </div>
        )}
        {settings.showAccuracy && (
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{state.accuracy}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">accuracy</div>
          </div>
        )}
        {settings.showTimer && (
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {config.mode === 'time' ? formatTime(remainingTime) : formatTime(displayElapsed)}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {config.mode === 'time' ? 'remaining' : 'time'}
            </div>
          </div>
        )}
      </div>

      {/* Typing Area */}
      <div
        ref={containerRef}
        className={`relative p-8 rounded-xl border transition-all ${
          isFocused ? 'border-gray-700 bg-gray-900/50' : 'border-gray-800 bg-gray-900/30'
        }`}
        onClick={() => setIsFocused(true)}
        tabIndex={0}
      >
        {!isFocused && !state.isRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl z-10 backdrop-blur-sm">
            <p className="text-gray-400 text-lg">Click here or start typing to focus</p>
          </div>
        )}

        <div
          ref={textRef}
          className="font-mono leading-relaxed max-h-40 overflow-hidden select-none relative"
          style={{ fontSize: `${settings.fontSize}px`, lineHeight: '2' }}
        >
          {renderText()}

          {/* Caret */}
          {settings.smoothCaret && state.currentIndex < state.text.length && (
            <span
              className="absolute w-0.5 bg-yellow-400 animate-pulse"
              style={{
                height: `${settings.fontSize * 1.2}px`,
                transition: 'all 0.05s ease',
              }}
            />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {state.isRunning && (
        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
            style={{ width: `${(state.currentIndex / state.text.length) * 100}%` }}
          />
        </div>
      )}

      {/* Hint */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        <span className="inline-flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">tab</kbd>
          <span>to restart</span>
          <span className="mx-2">•</span>
          <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">esc</kbd>
          <span>to new test</span>
        </span>
      </div>
    </div>
  );
};
