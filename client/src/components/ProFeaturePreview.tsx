import React from 'react';

interface ProFeaturePreviewProps {
  onUpgradeClick: () => void;
}

export const ProFeaturePreview: React.FC<ProFeaturePreviewProps> = ({ onUpgradeClick }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
      <h3 className="text-lg font-semibold mb-2">Pro Features Preview</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-gray-600">✨ Personalized names based on parents' names</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600">🚀 10 analyses per session</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600">⚡ Priority processing</span>
        </div>
        <button
          onClick={onUpgradeClick}
          className="mt-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          Upgrade to Pro for $3.99
        </button>
      </div>
    </div>
  );
}; 