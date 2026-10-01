import { TestResult, UserProfile, DailyChallenge, Language, Difficulty, TestMode } from '../types';
import { wordLists, quotes, codeSnippets, numberSets, difficultWords, punctuationWords } from '../data/words';

// WPM = (correct characters / 5) / elapsed minutes
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((correctChars / 5) / minutes);
}

export function calculateRawWPM(totalChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((totalChars / 5) / minutes);
}

export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes === 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 10000) / 100;
}

export function calculateConsistency(wpmHistory: { wpm: number }[]): number {
  if (wpmHistory.length < 2) return 100;
  const wpms = wpmHistory.map(h => h.wpm);
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  const variance = wpms.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  return Math.max(0, Math.round((100 - cv) * 100) / 100);
}

// Deterministic seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateDailyChallenge(date: Date): DailyChallenge {
  const dateStr = date.toISOString().split('T')[0];
  const seed = dateToSeed(dateStr);
  const random = seededRandom(seed);

  const challengeTypes = [
    'speed', 'accuracy', 'words', 'code', 'numbers', 'difficult',
    'punctuation', 'quote', 'mixed', 'endurance', 'precision', 'vocabulary'
  ];

  const typeIndex = Math.floor(random() * challengeTypes.length);
  const type = challengeTypes[typeIndex];

  const languages: Language[] = ['english', 'uzbek', 'russian'];
  const language = languages[Math.floor(random() * languages.length)];
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];
  const difficultyIndex = Math.floor(random() * difficulties.length);
  const difficulty = difficulties[difficultyIndex];

  let text = '';
  let mode: TestMode = 'time';
  let duration = 30;
  let wordCount = 25;
  let specialRule: string | undefined;
  let multiplier = 1;

  const words = wordLists[language];
  const pickWords = (count: number): string => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(words[Math.floor(random() * words.length)]);
    }
    return result.join(' ');
  };

  switch (type) {
    case 'speed':
      mode = 'time';
      duration = 15;
      wordCount = 50;
      text = pickWords(wordCount);
      multiplier = 1.2;
      specialRule = 'Speed challenge - type as fast as you can!';
      break;
    case 'accuracy':
      mode = 'time';
      duration = 60;
      wordCount = 40;
      text = pickWords(wordCount);
      multiplier = 1.5;
      specialRule = 'Accuracy challenge - mistakes cost double!';
      break;
    case 'words':
      mode = 'words';
      wordCount = 50;
      duration = 0;
      text = pickWords(wordCount);
      multiplier = 1.0;
      break;
    case 'code':
      mode = 'words';
      wordCount = 0;
      duration = 0;
      const snippets = codeSnippets.javascript.concat(codeSnippets.typescript);
      text = snippets[Math.floor(random() * snippets.length)];
      multiplier = 1.8;
      specialRule = 'Code typing - special characters matter!';
      break;
    case 'numbers':
      mode = 'words';
      wordCount = 0;
      duration = 0;
      const allNumbers = [...numberSets.integers, ...numberSets.decimals, ...numberSets.percentages];
      const numCount = 15 + Math.floor(random() * 10);
      const nums: string[] = [];
      for (let i = 0; i < numCount; i++) {
        nums.push(allNumbers[Math.floor(random() * allNumbers.length)]);
      }
      text = nums.join(' ');
      multiplier = 1.3;
      specialRule = 'Numbers challenge - precision with digits!';
      break;
    case 'difficult':
      mode = 'words';
      wordCount = 30;
      duration = 0;
      const diffWords = difficultWords[language] || difficultWords.english;
      const dw: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        dw.push(diffWords[Math.floor(random() * diffWords.length)]);
      }
      text = dw.join(' ');
      multiplier = 1.6;
      specialRule = 'Difficult vocabulary - watch for tricky spellings!';
      break;
    case 'punctuation':
      mode = 'words';
      wordCount = 0;
      duration = 0;
      const punctTexts = punctuationWords[language] || punctuationWords.english;
      text = punctTexts[Math.floor(random() * punctTexts.length)];
      multiplier = 1.4;
      specialRule = 'Punctuation challenge - every symbol counts!';
      break;
    case 'quote':
      mode = 'words';
      wordCount = 0;
      duration = 0;
      const langQuotes = quotes[language] || quotes.english;
      const quote = langQuotes[Math.floor(random() * langQuotes.length)];
      text = quote.text;
      multiplier = 1.1;
      break;
    case 'mixed':
      mode = 'time';
      duration = 30;
      wordCount = 35;
      text = pickWords(wordCount);
      multiplier = 1.2;
      specialRule = 'Mixed challenge - variety is key!';
      break;
    case 'endurance':
      mode = 'time';
      duration = 120;
      wordCount = 100;
      text = pickWords(wordCount);
      multiplier = 1.5;
      specialRule = 'Endurance challenge - keep going for 2 minutes!';
      break;
    case 'precision':
      mode = 'words';
      wordCount = 25;
      duration = 0;
      text = pickWords(wordCount);
      multiplier = 2.0;
      specialRule = 'Precision challenge - zero mistakes for bonus!';
      break;
    case 'vocabulary':
      mode = 'words';
      wordCount = 40;
      duration = 0;
      const longWords = words.filter(w => w.length > 6);
      const vw: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        vw.push(longWords[Math.floor(random() * longWords.length)] || words[Math.floor(random() * words.length)]);
      }
      text = vw.join(' ');
      multiplier = 1.4;
      specialRule = 'Vocabulary challenge - longer words!';
      break;
  }

  return {
    date: dateStr,
    text,
    mode,
    duration,
    wordCount,
    language,
    difficulty,
    specialRule,
    multiplier,
  };
}

export function calculateScore(wpm: number, accuracy: number, consistency: number, multiplier: number): number {
  const baseScore = wpm * (accuracy / 100) * (consistency / 100);
  return Math.round(baseScore * multiplier);
}

export function generateText(mode: TestMode, config: { duration: number; wordCount: number; language: Language; difficulty: Difficulty; customText?: string }): string {
  if (mode === 'custom' && config.customText) {
    return config.customText;
  }

  if (mode === 'quote') {
    const langQuotes = quotes[config.language] || quotes.english;
    const filtered = langQuotes.filter(q => {
      if (config.difficulty === 'easy') return q.length === 'short';
      if (config.difficulty === 'hard' || config.difficulty === 'expert') return q.length === 'long';
      return true;
    });
    const list = filtered.length > 0 ? filtered : langQuotes;
    return list[Math.floor(Math.random() * list.length)].text;
  }

  const words = wordLists[config.language] || wordLists.english;
  let pool = words;

  if (config.difficulty === 'hard' || config.difficulty === 'expert') {
    const diff = difficultWords[config.language] || difficultWords.english;
    pool = [...words.slice(0, 50), ...diff];
  } else if (config.difficulty === 'easy') {
    pool = words.slice(0, 100);
  }

  const count = mode === 'time' ? Math.max(50, config.duration * 2) : config.wordCount;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return result.join(' ');
}

export function generatePracticeText(category: string, language: Language = 'english'): string {
  const words = wordLists[language] || wordLists.english;

  switch (category) {
    case 'speed':
      return Array.from({ length: 60 }, () => words[Math.floor(Math.random() * 50)]).join(' ');
    case 'accuracy':
      return Array.from({ length: 30 }, () => words[Math.floor(Math.random() * 100)]).join(' ');
    case 'difficult': {
      const diff = difficultWords[language] || difficultWords.english;
      return Array.from({ length: 25 }, () => diff[Math.floor(Math.random() * diff.length)]).join(' ');
    }
    case 'numbers': {
      const allNums = [...numberSets.integers, ...numberSets.decimals, ...numberSets.percentages, ...numberSets.currency];
      return Array.from({ length: 20 }, () => allNums[Math.floor(Math.random() * allNums.length)]).join(' ');
    }
    case 'punctuation': {
      const punct = punctuationWords[language] || punctuationWords.english;
      return punct[Math.floor(Math.random() * punct.length)];
    }
    case 'programming': {
      const allSnippets = [...codeSnippets.javascript, ...codeSnippets.typescript, ...codeSnippets.python];
      return allSnippets[Math.floor(Math.random() * allSnippets.length)];
    }
    case 'quotes': {
      const langQuotes = quotes[language] || quotes.english;
      return langQuotes[Math.floor(Math.random() * langQuotes.length)].text;
    }
    default:
      return Array.from({ length: 40 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  }
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function checkAchievements(profile: UserProfile, results: TestResult[]): string[] {
  const unlocked: string[] = [];

  if (profile.totalTests >= 1) unlocked.push('first_test');
  if (profile.bestWpm >= 30) unlocked.push('wpm_30');
  if (profile.bestWpm >= 50) unlocked.push('wpm_50');
  if (profile.bestWpm >= 75) unlocked.push('wpm_75');
  if (profile.bestWpm >= 100) unlocked.push('wpm_100');
  if (profile.bestWpm >= 120) unlocked.push('wpm_120');
  if (profile.bestAccuracy >= 99) unlocked.push('accuracy_99');
  if (profile.bestAccuracy >= 100) unlocked.push('accuracy_100');
  if (profile.currentStreak >= 7) unlocked.push('streak_7');
  if (profile.currentStreak >= 30) unlocked.push('streak_30');
  if (profile.totalTests >= 100) unlocked.push('tests_100');
  if (profile.totalTests >= 500) unlocked.push('tests_500');
  if (profile.totalChallengeCompletions >= 1) unlocked.push('first_challenge');
  if (profile.longestStreak >= 7) unlocked.push('challenge_streak');

  const perfectTests = results.filter(r => r.accuracy === 100 && r.wpm > 0);
  if (perfectTests.length >= 1) unlocked.push('perfect_test');

  return unlocked;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function updateProfileStats(profile: UserProfile, results: TestResult[]): UserProfile {
  if (results.length === 0) return profile;

  const totalTests = results.length;
  const bestWpm = Math.max(...results.map(r => r.wpm));
  const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
  const bestAccuracy = Math.max(...results.map(r => r.accuracy));
  const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests * 100) / 100;

  return {
    ...profile,
    totalTests,
    bestWpm,
    averageWpm,
    bestAccuracy,
    averageAccuracy,
  };
}
