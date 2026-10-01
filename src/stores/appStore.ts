import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, TestResult, Achievement, UserSettings, WeakWord, DailyChallengeResult, Theme, CaretStyle } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Test Results
  results: TestResult[];
  addResult: (result: TestResult) => void;
  clearResults: () => void;

  // Daily Challenge
  dailyChallengeResults: DailyChallengeResult[];
  addDailyChallengeResult: (result: DailyChallengeResult) => void;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  initializeAchievements: () => void;

  // Weak Words
  weakWords: WeakWord[];
  addWeakWord: (word: string) => void;
  clearWeakWords: () => void;

  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Multiplayer
  multiplayerResults: TestResult[];
  addMultiplayerResult: (result: TestResult) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  caretStyle: 'line',
  smoothCaret: true,
  showTimer: true,
  showWpm: true,
  showAccuracy: true,
  soundEnabled: false,
  soundVolume: 0.5,
  fontSize: 24,
  fontFamily: 'monospace',
};

const defaultAchievements: Achievement[] = [
  { id: 'first_test', name: 'First Steps', description: 'Complete your first typing test', icon: '🎯', condition: () => false, unlocked: false },
  { id: 'wpm_30', name: 'Getting Started', description: 'Reach 30 WPM', icon: '⚡', condition: () => false, unlocked: false },
  { id: 'wpm_50', name: 'Average Typer', description: 'Reach 50 WPM', icon: '🔥', condition: () => false, unlocked: false },
  { id: 'wpm_75', name: 'Fast Fingers', description: 'Reach 75 WPM', icon: '💨', condition: () => false, unlocked: false },
  { id: 'wpm_100', name: 'Speed Demon', description: 'Reach 100 WPM', icon: '🚀', condition: () => false, unlocked: false },
  { id: 'wpm_120', name: 'Lightning Fast', description: 'Reach 120 WPM', icon: '⚡', condition: () => false, unlocked: false },
  { id: 'accuracy_99', name: 'Sharpshooter', description: 'Achieve 99% accuracy', icon: '🎯', condition: () => false, unlocked: false },
  { id: 'accuracy_100', name: 'Perfect', description: 'Achieve 100% accuracy', icon: '💎', condition: () => false, unlocked: false },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', condition: () => false, unlocked: false },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', condition: () => false, unlocked: false },
  { id: 'tests_100', name: 'Dedicated', description: 'Complete 100 tests', icon: '💪', condition: () => false, unlocked: false },
  { id: 'tests_500', name: 'Obsessed', description: 'Complete 500 tests', icon: '🧠', condition: () => false, unlocked: false },
  { id: 'first_challenge', name: 'Challenger', description: 'Complete your first daily challenge', icon: '📅', condition: () => false, unlocked: false },
  { id: 'challenge_streak', name: 'Streak Master', description: 'Maintain a 7-day challenge streak', icon: '📆', condition: () => false, unlocked: false },
  { id: 'perfect_test', name: 'Flawless', description: 'Complete a test with 100% accuracy', icon: '✨', condition: () => false, unlocked: false },
];

// Simulated user database
const usersDb: { email: string; password: string; username: string }[] = [];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,

      login: (email: string, password: string) => {
        const user = usersDb.find(u => u.email === email && u.password === password);
        if (user) {
          const profile: UserProfile = {
            id: uuidv4(),
            username: user.username,
            email: user.email,
            avatar: `https://api.dicebear.com/72/initials/${user.username}.png`,
            joinDate: Date.now(),
            totalTests: 0,
            bestWpm: 0,
            averageWpm: 0,
            bestAccuracy: 0,
            averageAccuracy: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastChallengeDate: null,
            totalChallengeCompletions: 0,
          };
          set({ isAuthenticated: true, user: profile });
          return true;
        }
        return false;
      },

      register: (username: string, email: string, password: string) => {
        if (usersDb.find(u => u.email === email)) return false;
        if (usersDb.find(u => u.username === username)) return false;
        usersDb.push({ email, password, username });
        const profile: UserProfile = {
          id: uuidv4(),
          username,
          email,
          avatar: `https://api.dicebear.com/72/initials/${username}.png`,
          joinDate: Date.now(),
          totalTests: 0,
          bestWpm: 0,
          averageWpm: 0,
          bestAccuracy: 0,
          averageAccuracy: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastChallengeDate: null,
          totalChallengeCompletions: 0,
        };
        set({ isAuthenticated: true, user: profile });
        return true;
      },

      logout: () => set({ isAuthenticated: false, user: null }),

      updateProfile: (updates: Partial<UserProfile>) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      results: [],
      addResult: (result: TestResult) => {
        const results = [...get().results, result];
        const user = get().user;
        let updatedUser = user;

        if (user) {
          const totalTests = results.length;
          const bestWpm = Math.max(...results.map(r => r.wpm));
          const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
          const bestAccuracy = Math.max(...results.map(r => r.accuracy));
          const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests * 100) / 100;

          updatedUser = {
            ...user,
            totalTests,
            bestWpm,
            averageWpm,
            bestAccuracy,
            averageAccuracy,
          };
        }

        set({ results, user: updatedUser });
      },

      clearResults: () => set({ results: [] }),

      dailyChallengeResults: [],
      addDailyChallengeResult: (result: DailyChallengeResult) => {
        const results = [...get().dailyChallengeResults, result];
        const user = get().user;
        let updatedUser = user;

        if (user) {
          // Update streak
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          let currentStreak = user.currentStreak;

          if (user.lastChallengeDate === yesterday || user.lastChallengeDate === today) {
            if (user.lastChallengeDate === yesterday) currentStreak += 1;
          } else if (user.lastChallengeDate !== today) {
            currentStreak = 1;
          }

          updatedUser = {
            ...user,
            currentStreak,
            longestStreak: Math.max(user.longestStreak, currentStreak),
            lastChallengeDate: today,
            totalChallengeCompletions: user.totalChallengeCompletions + 1,
          };
        }

        set({ dailyChallengeResults: results, user: updatedUser });
      },

      achievements: defaultAchievements,
      unlockAchievement: (id: string) => {
        const achievements = get().achievements.map(a =>
          a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
        set({ achievements });
      },
      initializeAchievements: () => set({ achievements: defaultAchievements }),

      weakWords: [],
      addWeakWord: (word: string) => {
        const weakWords = [...get().weakWords];
        const existing = weakWords.find(w => w.word === word);
        if (existing) {
          existing.mistakes += 1;
          existing.totalAttempts += 1;
          existing.accuracy = Math.round(((existing.totalAttempts - existing.mistakes) / existing.totalAttempts) * 100);
        } else {
          weakWords.push({ word, mistakes: 1, totalAttempts: 1, accuracy: 0 });
        }
        set({ weakWords });
      },
      clearWeakWords: () => set({ weakWords: [] }),

      settings: defaultSettings,
      updateSettings: (updates: Partial<UserSettings>) => {
        set({ settings: { ...get().settings, ...updates } });
      },

      multiplayerResults: [],
      addMultiplayerResult: (result: TestResult) => {
        set({ multiplayerResults: [...get().multiplayerResults, result] });
      },
    }),
    {
      name: 'typing-platform-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        results: state.results,
        dailyChallengeResults: state.dailyChallengeResults,
        achievements: state.achievements,
        weakWords: state.weakWords,
        settings: state.settings,
        multiplayerResults: state.multiplayerResults,
      }),
    }
  )
);
