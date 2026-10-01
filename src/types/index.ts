export type TestMode = 'time' | 'words' | 'quote' | 'custom';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
export type Language = 'english' | 'uzbek' | 'russian';
export type CaretStyle = 'line' | 'block' | 'underline';
export type Theme = 'dark' | 'light' | 'midnight' | 'minimal' | 'high-contrast';

export interface TestConfig {
  mode: TestMode;
  duration: number; // seconds for time mode
  wordCount: number; // for words mode
  language: Language;
  difficulty: Difficulty;
  customText?: string;
}

export interface Keystroke {
  char: string;
  correct: boolean;
  timestamp: number;
}

export interface TypingState {
  text: string;
  currentIndex: number;
  typedChars: string[];
  correctChars: number;
  incorrectChars: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  startTime: number | null;
  endTime: number | null;
  isRunning: boolean;
  isFinished: boolean;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  keystrokes: Keystroke[];
  wpmHistory: { time: number; wpm: number; accuracy: number }[];
}

export interface TestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  duration: number;
  mode: TestMode;
  language: Language;
  difficulty: Difficulty;
  text: string;
  timestamp: number;
  wpmHistory: { time: number; wpm: number; accuracy: number }[];
  isDailyChallenge?: boolean;
  dailyChallengeDate?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  joinDate: number;
  totalTests: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastChallengeDate: string | null;
  totalChallengeCompletions: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserProfile, results: TestResult[]) => boolean;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface DailyChallenge {
  date: string;
  text: string;
  mode: TestMode;
  duration: number;
  wordCount: number;
  language: Language;
  difficulty: Difficulty;
  specialRule?: string;
  multiplier: number;
}

export interface DailyChallengeResult {
  date: string;
  wpm: number;
  accuracy: number;
  rawWpm: number;
  score: number;
  duration: number;
  errors: number;
  timestamp: number;
}

export interface PracticeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  textGenerator: () => string;
}

export interface UserSettings {
  theme: Theme;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  showTimer: boolean;
  showWpm: boolean;
  showAccuracy: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  fontSize: number;
  fontFamily: string;
}

export interface WeakWord {
  word: string;
  mistakes: number;
  totalAttempts: number;
  accuracy: number;
}

export interface MultiplayerRoom {
  id: string;
  code: string;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  text: string;
  startTime?: number;
}

export interface MultiplayerPlayer {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number;
  placement?: number;
}
