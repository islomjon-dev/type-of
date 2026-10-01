import React from 'react';
import { useAppStore } from '../stores/appStore';
import { Settings as SettingsIcon, Moon, Sun, Type, Volume2, Eye } from 'lucide-react';
import { Theme, CaretStyle } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isAuthenticated } = useAppStore();

  const themes: { value: Theme; label: string; preview: string }[] = [
    { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-gray-700' },
    { value: 'light', label: 'Light', preview: 'bg-gray-100 border-gray-300' },
    { value: 'midnight', label: 'Midnight', preview: 'bg-gray-950 border-blue-900' },
    { value: 'minimal', label: 'Minimal', preview: 'bg-black border-gray-800' },
    { value: 'high-contrast', label: 'High Contrast', preview: 'bg-black border-white' },
  ];

  const caretStyles: { value: CaretStyle; label: string }[] = [
    { value: 'line', label: 'Line' },
    { value: 'block', label: 'Block' },
    { value: 'underline', label: 'Underline' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pt-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-yellow-400" />
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-gray-400" />
          Appearance
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Theme</label>
            <div className="grid grid-cols-5 gap-2">
              {themes.map(theme => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.theme === theme.value ? 'border-yellow-500' : 'border-gray-700'
                  } ${theme.preview}`}
                >
                  <span className={`text-xs ${theme.value === 'light' ? 'text-gray-800' : 'text-white'}`}>
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Font Size: {settings.fontSize}px</label>
            <input
              type="range"
              min="16"
              max="36"
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-yellow-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => updateSettings({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value="monospace">Monospace</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
              <option value="'Fira Code', monospace">Fira Code</option>
            </select>
          </div>
        </div>
      </section>

      {/* Typing */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-gray-400" />
          Typing
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Caret Style</label>
            <div className="flex gap-2">
              {caretStyles.map(style => (
                <button
                  key={style.value}
                  onClick={() => updateSettings({ caretStyle: style.value })}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    settings.caretStyle === style.value
                      ? 'bg-yellow-500 text-gray-900 font-medium'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Smooth Caret</span>
            <button
              onClick={() => updateSettings({ smoothCaret: !settings.smoothCaret })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.smoothCaret ? 'bg-yellow-500' : 'bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.smoothCaret ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* Display */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          Display
        </h2>

        <div className="space-y-3">
          {[
            { key: 'showTimer' as const, label: 'Show Timer' },
            { key: 'showWpm' as const, label: 'Show WPM' },
            { key: 'showAccuracy' as const, label: 'Show Accuracy' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-gray-300">{item.label}</span>
              <button
                onClick={() => updateSettings({ [item.key]: !settings[item.key] })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings[item.key] ? 'bg-yellow-500' : 'bg-gray-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sound */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-gray-400" />
          Sound
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Enable Sounds</span>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-yellow-500' : 'bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {settings.soundEnabled && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Volume: {Math.round(settings.soundVolume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume * 100}
                onChange={(e) => updateSettings({ soundVolume: parseInt(e.target.value) / 100 })}
                className="w-full accent-yellow-500"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
