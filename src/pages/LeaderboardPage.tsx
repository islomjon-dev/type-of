import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

type LeaderboardType = 'daily' | 'weekly' | 'monthly' | 'alltime';

export const LeaderboardPage: React.FC = () => {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('alltime');
  const { results, dailyChallengeResults, isAuthenticated, user } = useAppStore();

  // Build leaderboard from actual results
  const leaderboard = useMemo(() => {
    let filteredResults = results;
    const now = Date.now();

    switch (leaderboardType) {
      case 'daily':
        filteredResults = results.filter(r => now - r.timestamp < 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        filteredResults = results.filter(r => now - r.timestamp < 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        filteredResults = results.filter(r => now - r.timestamp < 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Group by best WPM
    const entries = filteredResults
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 50)
      .map((r, i) => ({
        rank: i + 1,
        username: user?.username || 'You',
        wpm: r.wpm,
        accuracy: r.accuracy,
        date: new Date(r.timestamp).toLocaleDateString(),
        isUser: true,
      }));

    return entries;
  }, [results, leaderboardType, user]);

  const dailyLeaderboard = useMemo(() => {
    return dailyChallengeResults
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({
        rank: i + 1,
        username: user?.username || 'You',
        wpm: r.wpm,
        accuracy: r.accuracy,
        score: r.score,
        date: r.date,
        isUser: true,
      }));
  }, [dailyChallengeResults, user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pt-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-400 mt-2">Compete with the best typists</p>
      </div>

      {/* Type Selector */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['daily', 'weekly', 'monthly', 'alltime'] as LeaderboardType[]).map(type => (
          <button
            key={type}
            onClick={() => setLeaderboardType(type)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              leaderboardType === type
                ? 'bg-yellow-500 text-gray-900 font-medium'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {type === 'alltime' ? 'All Time' : type}
          </button>
        ))}
      </div>

      {/* Main Leaderboard */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top WPM Scores
          </h3>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No results yet. Complete a typing test to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left p-3 w-16">Rank</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">WPM</th>
                  <th className="text-left p-3">Accuracy</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={i} className={`border-b border-gray-800/50 ${entry.isUser ? 'bg-yellow-500/5' : ''}`}>
                    <td className="p-3">
                      {entry.rank <= 3 ? (
                        <span className="text-lg">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-gray-400">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="p-3 text-white font-medium">{entry.username}</td>
                    <td className="p-3 text-yellow-400 font-bold">{entry.wpm}</td>
                    <td className="p-3 text-gray-300">{entry.accuracy}%</td>
                    <td className="p-3 text-gray-400">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Challenge Leaderboard */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Medal className="w-4 h-4" />
            Daily Challenge Scores
          </h3>
        </div>

        {dailyLeaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No daily challenge results yet. Complete a daily challenge!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left p-3 w-16">Rank</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">WPM</th>
                  <th className="text-left p-3">Accuracy</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {dailyLeaderboard.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-800/50 bg-yellow-500/5">
                    <td className="p-3">
                      {entry.rank <= 3 ? (
                        <span className="text-lg">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-gray-400">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="p-3 text-white font-medium">{entry.username}</td>
                    <td className="p-3 text-yellow-400 font-bold">{entry.score}</td>
                    <td className="p-3 text-gray-300">{entry.wpm}</td>
                    <td className="p-3 text-gray-300">{entry.accuracy}%</td>
                    <td className="p-3 text-gray-400">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
