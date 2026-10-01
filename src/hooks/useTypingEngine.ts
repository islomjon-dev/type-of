import { useState, useCallback, useRef, useEffect } from 'react';
import { TypingState, TestConfig, TestResult } from '../types';
import { calculateWPM, calculateRawWPM, calculateAccuracy, calculateConsistency, generateText } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

export function useTypingEngine(config: TestConfig) {
  const [state, setState] = useState<TypingState>({
    text: '',
    currentIndex: 0,
    typedChars: [],
    correctChars: 0,
    incorrectChars: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
    correctedErrors: 0,
    uncorrectedErrors: 0,
    startTime: null,
    endTime: null,
    isRunning: false,
    isFinished: false,
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    consistency: 100,
    keystrokes: [],
    wpmHistory: [],
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const initializeText = useCallback(() => {
    const text = generateText(config.mode, {
      duration: config.duration,
      wordCount: config.wordCount,
      language: config.language,
      difficulty: config.difficulty,
      customText: config.customText,
    });
    setState(prev => ({
      ...prev,
      text,
      currentIndex: 0,
      typedChars: [],
      correctChars: 0,
      incorrectChars: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      incorrectKeystrokes: 0,
      correctedErrors: 0,
      uncorrectedErrors: 0,
      startTime: null,
      endTime: null,
      isRunning: false,
      isFinished: false,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      consistency: 100,
      keystrokes: [],
      wpmHistory: [],
    }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [config]);

  useEffect(() => {
    initializeText();
  }, [initializeText]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      const s = stateRef.current;
      if (!s.startTime || s.isFinished) return;

      const elapsed = (Date.now() - s.startTime) / 1000;

      // Check if time mode and time is up
      if (config.mode === 'time' && config.duration > 0 && elapsed >= config.duration) {
        finishTest();
        return;
      }

      // Update WPM history every second
      const wpm = calculateWPM(s.correctChars, elapsed);
      const accuracy = calculateAccuracy(s.correctKeystrokes, s.totalKeystrokes);

      setState(prev => ({
        ...prev,
        wpm,
        rawWpm: calculateRawWPM(prev.totalKeystrokes, elapsed),
        accuracy,
        wpmHistory: [...prev.wpmHistory, { time: elapsed, wpm, accuracy }],
      }));
    }, 1000);
  }, [config]);

  const finishTest = useCallback(() => {
    const s = stateRef.current;
    if (s.isFinished) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const endTime = Date.now();
    const elapsed = s.startTime ? (endTime - s.startTime) / 1000 : 0;
    const wpm = calculateWPM(s.correctChars, elapsed);
    const rawWpm = calculateRawWPM(s.totalKeystrokes, elapsed);
    const accuracy = calculateAccuracy(s.correctKeystrokes, s.totalKeystrokes);
    const consistency = calculateConsistency(s.wpmHistory);

    setState(prev => ({
      ...prev,
      endTime,
      isRunning: false,
      isFinished: true,
      wpm,
      rawWpm,
      accuracy,
      consistency,
    }));
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    const s = stateRef.current;
    if (s.isFinished) return;

    // Start timer on first keypress
    if (!s.isRunning && !s.isFinished) {
      setState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
      setTimeout(() => startTimer(), 0);
    }

    if (key === 'Backspace') {
      if (s.currentIndex > 0) {
        const prevChar = s.typedChars[s.currentIndex - 1];
        const wasCorrect = prevChar === s.text[s.currentIndex - 1];

        setState(prev => {
          const newTyped = prev.typedChars.slice(0, -1);
          const newIndex = prev.currentIndex - 1;
          let correctedErrors = prev.correctedErrors;
          let uncorrectedErrors = prev.uncorrectedErrors;

          if (!wasCorrect) {
            correctedErrors += 1;
            uncorrectedErrors = Math.max(0, uncorrectedErrors - 1);
          }

          return {
            ...prev,
            typedChars: newTyped,
            currentIndex: newIndex,
            correctedErrors,
            uncorrectedErrors,
          };
        });
      }
      return;
    }

    if (key.length !== 1) return;

    const expectedChar = s.text[s.currentIndex];
    const isCorrect = key === expectedChar;

    setState(prev => {
      const newTyped = [...prev.typedChars, key];
      const newIndex = prev.currentIndex + 1;
      const correctChars = prev.correctChars + (isCorrect ? 1 : 0);
      const incorrectChars = prev.incorrectChars + (isCorrect ? 0 : 1);
      const totalKeystrokes = prev.totalKeystrokes + 1;
      const correctKeystrokes = prev.correctKeystrokes + (isCorrect ? 1 : 0);
      const incorrectKeystrokes = prev.incorrectKeystrokes + (isCorrect ? 0 : 1);
      let uncorrectedErrors = prev.uncorrectedErrors + (isCorrect ? 0 : 1);

      const elapsed = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0;
      const wpm = calculateWPM(correctChars, elapsed || 1);
      const accuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);

      const newState = {
        ...prev,
        typedChars: newTyped,
        currentIndex: newIndex,
        correctChars,
        incorrectChars,
        totalKeystrokes,
        correctKeystrokes,
        incorrectKeystrokes,
        uncorrectedErrors,
        wpm,
        rawWpm: calculateRawWPM(totalKeystrokes, elapsed || 1),
        accuracy,
        keystrokes: [...prev.keystrokes, { char: key, correct: isCorrect, timestamp: Date.now() }],
      };

      // Check if finished (words mode)
      if (newIndex >= prev.text.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const finalElapsed = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0;
        return {
          ...newState,
          isFinished: true,
          isRunning: false,
          endTime: Date.now(),
          wpm: calculateWPM(correctChars, finalElapsed),
          rawWpm: calculateRawWPM(totalKeystrokes, finalElapsed),
          accuracy: calculateAccuracy(correctKeystrokes, totalKeystrokes),
          consistency: calculateConsistency([...prev.wpmHistory, { time: finalElapsed, wpm, accuracy }]),
          wpmHistory: [...prev.wpmHistory, { time: finalElapsed, wpm, accuracy }],
        };
      }

      return newState;
    });
  }, [startTimer]);

  const getResult = useCallback((): TestResult | null => {
    const s = stateRef.current;
    if (!s.isFinished) return null;

    const elapsed = s.startTime && s.endTime ? (s.endTime - s.startTime) / 1000 : 0;

    return {
      id: uuidv4(),
      wpm: s.wpm,
      rawWpm: s.rawWpm,
      accuracy: s.accuracy,
      consistency: s.consistency,
      totalChars: s.text.length,
      correctChars: s.correctChars,
      incorrectChars: s.incorrectChars,
      totalKeystrokes: s.totalKeystrokes,
      correctKeystrokes: s.correctKeystrokes,
      incorrectKeystrokes: s.incorrectKeystrokes,
      correctedErrors: s.correctedErrors,
      uncorrectedErrors: s.uncorrectedErrors,
      duration: elapsed,
      mode: config.mode,
      language: config.language,
      difficulty: config.difficulty,
      text: s.text,
      timestamp: Date.now(),
      wpmHistory: s.wpmHistory,
    };
  }, [config]);

  return {
    state,
    handleKeyPress,
    initializeText,
    finishTest,
    getResult,
  };
}
