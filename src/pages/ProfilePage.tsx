import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { User, Edit2, Trophy, Target, Flame, Calendar, BarChart3 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { isAuthenticated, user, results, dailyChallengeResults, achievements, updateProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
          <p className="text-gray-400">Sign in to view your profile</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    if (editUsername.trim()) {
      updateProfile({ username: editUsername.trim() });
    }
    setIsEditing(false);
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pt-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-gray-900">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                />
                <button onClick={handleSaveProfile} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-white">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-gray-400 text-sm mt-1">
              Joined {new Date(user.joinDate).toLocaleDateString()} • {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
          <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{user.totalTests}</div>
          <div className="text-xs text-gray-400">Total Tests</div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-yellow-400">{user.bestWpm}</div>
          <div className="text-xs text-gray-400">Best WPM</div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
          <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{user.averageWpm}</div>
          <div className="text-xs text-gray-400">Avg WPM</div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-orange-400">{user.currentStreak}</div>
          <div className="text-xs text-gray-400">Day Streak</div>
        </div>
      </div>

      {/* More Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-white font-medium mb-3">Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Best Accuracy</span>
              <span className="text-white">{user.bestAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Accuracy</span>
              <span className="text-white">{user.averageAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longest Streak</span>
              <span className="text-white">{user.longestStreak} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Challenges Completed</span>
              <span className="text-white">{user.totalChallengeCompletions}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-white font-medium mb-3">Achievements</h3>
          {unlockedAchievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unlockedAchievements.slice(0, 10).map(a => (
                <span key={a.id} className="text-2xl" title={a.name}>{a.icon}</span>
              ))}
              {unlockedAchievements.length > 10 && (
                <span className="text-sm text-gray-400 self-center">+{unlockedAchievements.length - 10} more</span>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No achievements unlocked yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Recent Activity</h3>
        </div>
        {results.length > 0 ? (
          <div className="divide-y divide-gray-800/50">
            {results.slice(-10).reverse().map((r, i) => (
              <div key={i} className="p-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white font-medium">{r.wpm} wpm</span>
                  <span className="text-gray-400">{r.accuracy}%</span>
                  <span className="text-gray-500 capitalize">{r.mode}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No activity yet. Complete a typing test to get started!
          </div>
        )}
      </div>
    </div>
  );
};
