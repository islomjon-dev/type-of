import React, { useState } from 'react';
import { X, PenTool } from 'lucide-react';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onSubmit(text.trim());
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Custom Text</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your custom text here..."
          className="w-full h-40 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none resize-none"
          autoFocus
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">{text.length} characters</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={text.trim().length === 0}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
