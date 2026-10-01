import React from 'react';
import { Keyboard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Keyboard className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">TypeFlow © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Contact</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">About</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms</span>
          </div>

          <div className="text-xs text-gray-600">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">tab</kbd> restart
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">esc</kbd> new test
          </div>
        </div>
      </div>
    </footer>
  );
};
