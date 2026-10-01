import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Award, X } from 'lucide-react';

export const AchievementToast: React.FC = () => {
  const [notifications, setNotifications] = useState<{ id: string; name: string; icon: string }[]>([]);
  const achievements = useAppStore(s => s.achievements);
  const [prevUnlocked, setPrevUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentUnlocked = new Set(achievements.filter(a => a.unlocked).map(a => a.id));

    // Check for newly unlocked achievements
    currentUnlocked.forEach(id => {
      if (!prevUnlocked.has(id)) {
        const achievement = achievements.find(a => a.id === id);
        if (achievement) {
          setNotifications(prev => [...prev, { id, name: achievement.name, icon: achievement.icon }]);
          // Auto-remove after 4 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }, 4000);
        }
      }
    });

    setPrevUnlocked(currentUnlocked);
  }, [achievements]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-yellow-500/50 rounded-xl shadow-lg shadow-yellow-500/10 animate-in"
        >
          <span className="text-2xl">{notif.icon}</span>
          <div>
            <div className="text-xs text-yellow-400 uppercase tracking-wider">Achievement Unlocked!</div>
            <div className="text-white font-medium">{notif.name}</div>
          </div>
          <button
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
