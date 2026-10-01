import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Play, Clock, CheckCircle, Zap } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { TestResult, MultiplayerPlayer } from '../types';
import { v4 as uuidv4 } from 'uuid';

type RoomStatus = 'idle' | 'lobby' | 'countdown' | 'racing' | 'finished';

export const MultiplayerPage: React.FC = () => {
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [raceText, setRaceText] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [raceResults, setRaceResults] = useState<MultiplayerPlayer[]>([]);
  const { isAuthenticated, user, addMultiplayerResult } = useAppStore();

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const practiceTexts = [
    'The quick brown fox jumps over the lazy dog near the river bank while the sun sets behind the mountains creating a beautiful orange sky',
    'Programming is the art of telling another human what one wants the computer to do and solving problems with elegant code that others can read',
    'Technology continues to evolve at an unprecedented pace bringing new opportunities and challenges that require creative thinking and adaptability',
    'Success is not final failure is not fatal it is the courage to continue that counts in the journey of life and personal growth',
  ];

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    const me: MultiplayerPlayer = {
      id: uuidv4(),
      username: user?.username || 'You',
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finished: false,
    };
    setPlayers([me]);
    setStatus('lobby');
  };

  const handleJoinRoom = () => {
    if (joinCode.length < 4) return;
    setRoomCode(joinCode.toUpperCase());
    const me: MultiplayerPlayer = {
      id: uuidv4(),
      username: user?.username || 'You',
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finished: false,
    };
    // Simulate other players joining
    const botNames = ['SpeedTyper', 'KeyMaster', 'TypeNinja', 'FastFingers'];
    const botCount = 1 + Math.floor(Math.random() * 3);
    const bots: MultiplayerPlayer[] = Array.from({ length: botCount }, (_, i) => ({
      id: uuidv4(),
      username: botNames[Math.floor(Math.random() * botNames.length)] + Math.floor(Math.random() * 100),
      progress: 0,
      wpm: 0,
      accuracy: 95 + Math.floor(Math.random() * 5),
      finished: false,
    }));
    setPlayers([me, ...bots]);
    setStatus('lobby');
  };

  const handleStartRace = () => {
    const text = practiceTexts[Math.floor(Math.random() * practiceTexts.length)];
    setRaceText(text);
    setCountdown(5);
    setStatus('countdown');
  };

  useEffect(() => {
    if (status !== 'countdown') return;
    if (countdown <= 0) {
      setStatus('racing');
      setStartTime(Date.now());
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // Simulate bot progress
  useEffect(() => {
    if (status !== 'racing') return;
    const interval = setInterval(() => {
      setPlayers(prev => prev.map(p => {
        if (p.id === players[0]?.id) return p; // Don't move the user
        if (p.finished) return p;
        const increment = 0.5 + Math.random() * 2;
        const newProgress = Math.min(100, p.progress + increment);
        const newWpm = Math.round(30 + Math.random() * 60);
        return {
          ...p,
          progress: newProgress,
          wpm: newWpm,
          finished: newProgress >= 100,
          finishTime: newProgress >= 100 ? Date.now() : undefined,
        };
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [status]);

  // Timer
  useEffect(() => {
    if (status !== 'racing' || !startTime) return;
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Handle user typing
  const handleUserInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'racing') return;
    const value = e.target.value;
    setCurrentInput(value);

    // Calculate progress
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === raceText[i]) correct++;
    }
    const newProgress = (correct / raceText.length) * 100;
    setProgress(newProgress);

    // Update player
    setPlayers(prev => prev.map((p, i) => {
      if (i !== 0) return p;
      const wpm = elapsed > 0 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
      const accuracy = value.length > 0 ? Math.round((correct / value.length) * 100) : 100;
      const finished = newProgress >= 100;
      return {
        ...p,
        progress: newProgress,
        wpm,
        accuracy,
        finished,
        finishTime: finished ? Date.now() : undefined,
      };
    }));

    // Check if finished
    if (newProgress >= 100) {
      setStatus('finished');
      // Calculate final placements
      const sorted = [...players].sort((a, b) => {
        if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
        if (a.finished) return -1;
        if (b.finished) return 1;
        return b.progress - a.progress;
      }).map((p, i) => ({ ...p, placement: i + 1 }));
      setRaceResults(sorted);
    }
  }, [status, raceText, elapsed, players]);

  // Check if all bots finished
  useEffect(() => {
    if (status !== 'racing') return;
    const allBotsFinished = players.slice(1).every(p => p.finished);
    if (allBotsFinished && !players[0]?.finished) {
      // Force finish after a delay
      setTimeout(() => {
        if (status === 'racing') {
          setStatus('finished');
          const sorted = [...players].sort((a, b) => {
            if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
            if (a.finished) return -1;
            if (b.finished) return 1;
            return b.progress - a.progress;
          }).map((p, i) => ({ ...p, placement: i + 1 }));
          setRaceResults(sorted);
        }
      }, 2000);
    }
  }, [players, status]);

  const handleReset = () => {
    setStatus('idle');
    setRoomCode('');
    setPlayers([]);
    setProgress(0);
    setCurrentInput('');
    setElapsed(0);
    setRaceResults([]);
  };

  if (status === 'idle') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Users className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-white">Multiplayer Race</h1>
            <p className="text-gray-400 mt-2">Race against other typists in real-time</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full p-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Create Room
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              />
              <button
                onClick={handleJoinRoom}
                disabled={joinCode.length < 4}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'lobby') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Race Lobby</h2>
            <div className="mt-2 p-3 bg-gray-800 rounded-lg inline-block">
              <span className="text-gray-400 text-sm">Room Code: </span>
              <span className="text-yellow-400 font-mono text-xl font-bold">{roomCode}</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                    {p.username[0]}
                  </div>
                  <span className="text-white">{p.username}</span>
                </div>
                {i === 0 && <span className="text-xs text-yellow-400">You</span>}
              </div>
            ))}
          </div>

          <button
            onClick={handleStartRace}
            className="w-full p-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Race
          </button>
        </div>
      </div>
    );
  }

  if (status === 'countdown') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl font-bold text-yellow-400 animate-pulse">{countdown || 'GO!'}</div>
          <p className="text-gray-400 mt-4">Get ready to type...</p>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Race Results</h2>
          </div>

          <div className="space-y-2 mb-6">
            {raceResults.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                p.id === players[0]?.id ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-900/50 border-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {p.placement === 1 ? '🥇' : p.placement === 2 ? '🥈' : p.placement === 3 ? '🥉' : `#${p.placement}`}
                  </span>
                  <span className="text-white font-medium">{p.username}</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">{p.wpm} WPM</div>
                  <div className="text-xs text-gray-400">{p.accuracy}% accuracy</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
          >
            Race Again
          </button>
        </div>
      </div>
    );
  }

  // Racing status
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Timer */}
        <div className="text-center mb-4">
          <span className="text-3xl font-mono font-bold text-white">{elapsed.toFixed(1)}s</span>
        </div>

        {/* Race Text */}
        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 mb-6 font-mono text-lg leading-relaxed">
          {raceText.split('').map((char, i) => {
            let className = 'text-gray-600';
            if (i < currentInput.length) {
              className = currentInput[i] === char ? 'text-green-400' : 'text-red-400 bg-red-400/10';
            } else if (i === currentInput.length) {
              className = 'text-white bg-white/10 rounded';
            }
            return <span key={i} className={className}>{char}</span>;
          })}
        </div>

        {/* Input */}
        <input
          type="text"
          value={currentInput}
          onChange={handleUserInput}
          autoFocus
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono focus:border-yellow-500 focus:outline-none"
          placeholder="Start typing..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Player Progress */}
        <div className="mt-6 space-y-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-24 truncate">{p.username}</span>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    p.id === players[0]?.id ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-16 text-right">{p.wpm} wpm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
