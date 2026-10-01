import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Target, Clock } from 'lucide-react';

type TimeFilter = '7' | '30' | '90' | 'all';

export const StatisticsPage: React.FC = () => {
  const { results, isAuthenticated, user } = useAppStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30');
  const [chartType, setChartType] = useState<'wpm' | 'accuracy' | 'volume'>('wpm');

  const filteredResults = useMemo(() => {
    if (timeFilter === 'all') return results;
    const days = parseInt(timeFilter);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return results.filter(r => r.timestamp >= cutoff);
  }, [results, timeFilter]);

  const wpmOverTime = useMemo(() => {
    return filteredResults.map((r, i) => ({
      test: i + 1,
      wpm: r.wpm,
      accuracy: r.accuracy,
      date: new Date(r.timestamp).toLocaleDateString(),
    }));
  }, [filteredResults]);

  const dailyVolume = useMemo(() => {
    const volume: Record<string, number> = {};
    filteredResults.forEach(r => {
      const date = new Date(r.timestamp).toLocaleDateString();
      volume[date] = (volume[date] || 0) + 1;
    });
    return Object.entries(volume).map(([date, count]) => ({ date, count }));
  }, [filteredResults]);

  const stats = useMemo(() => {
    if (filteredResults.length === 0) return null;
    const wpms = filteredResults.map(r => r.wpm);
    const accuracies = filteredResults.map(r => r.accuracy);
    return {
      avgWpm: Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length),
      bestWpm: Math.max(...wpms),
      avgAccuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length * 100) / 100,
      bestAccuracy: Math.max(...accuracies),
      totalTests: filteredResults.length,
      totalTime: Math.round(filteredResults.reduce((a, b) => a + b.duration, 0)),
    };
  }, [filteredResults]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Statistics</h2>
          <p className="text-gray-400">Sign in to track your typing statistics over time.</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Statistics Yet</h2>
          <p className="text-gray-400">Complete some typing tests to see your statistics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pt-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Statistics</h1>
          <p className="text-gray-400 mt-1">Track your typing progress</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7', '30', '90', 'all'] as TimeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                timeFilter === f ? 'bg-yellow-500 text-gray-900 font-medium' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : `${f}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-white">{stats.avgWpm}</div>
            <div className="text-sm text-gray-400">Avg WPM</div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-yellow-400">{stats.bestWpm}</div>
            <div className="text-sm text-gray-400">Best WPM</div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-white">{stats.avgAccuracy}%</div>
            <div className="text-sm text-gray-400">Avg Accuracy</div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-white">{stats.totalTests}</div>
            <div className="text-sm text-gray-400">Total Tests</div>
          </div>
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="flex items-center gap-2 mb-4">
        {(['wpm', 'accuracy', 'volume'] as const).map(type => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              chartType === type ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {type === 'wpm' && 'WPM Over Time'}
            {type === 'accuracy' && 'Accuracy Over Time'}
            {type === 'volume' && 'Test Volume'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 mb-8">
        {chartType === 'wpm' && (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={wpmOverTime}>
              <defs>
                <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="test" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="wpm" stroke="#eab308" fill="url(#wpmGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {chartType === 'accuracy' && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={wpmOverTime}>
              <XAxis dataKey="test" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {chartType === 'volume' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyVolume}>
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Results Table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Recent Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">WPM</th>
                <th className="text-left p-3">Accuracy</th>
                <th className="text-left p-3">Mode</th>
                <th className="text-left p-3">Language</th>
                <th className="text-left p-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.slice().reverse().slice(0, 20).map((r, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3 text-gray-300">{new Date(r.timestamp).toLocaleDateString()}</td>
                  <td className="p-3 text-white font-medium">{r.wpm}</td>
                  <td className="p-3 text-gray-300">{r.accuracy}%</td>
                  <td className="p-3 text-gray-300 capitalize">{r.mode}</td>
                  <td className="p-3 text-gray-300 capitalize">{r.language}</td>
                  <td className="p-3 text-gray-300">{r.duration.toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
