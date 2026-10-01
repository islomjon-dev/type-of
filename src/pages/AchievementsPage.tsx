import React, { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { checkAchievements } from '../utils/calculations';
import { Award, Lock, Unlock } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { achievements, user, results, isAuthenticated, unlockAchievement } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newAchievements = checkAchievements(user, results);
      newAchievements.forEach(id => {
        const achievement = achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
          unlockAchievement(id);
        }
      });
    }
  }, [isAuthenticated, user, results]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pt-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-white">Achievements</h1>
        <p className="text-gray-400 mt-2">
          {isAuthenticated
            ? `${unlockedCount} of ${achievements.length} unlocked`
            : 'Sign in to track your achievements'}
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="text-center p-8 bg-gray-900/50 rounded-xl border border-gray-800">
          <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Create an account to unlock achievements</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border transition-all ${
                achievement.unlocked
                  ? 'bg-gray-900/50 border-yellow-500/30'
                  : 'bg-gray-900/30 border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div>
                  <h3 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">{achievement.description}</p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-yellow-400/70 mt-1">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
