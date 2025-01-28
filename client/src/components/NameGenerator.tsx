import React, { useState } from 'react';
import axios from 'axios';
import { generateSessionId } from '../utils/session';
import { UpgradeModal } from './UpgradeModal';

interface GeneratedName {
  name: string;
  meaning?: string;
  origin?: string;
}

export const NameGenerator: React.FC = () => {
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [criteria, setCriteria] = useState({
    gender: 'neutral',
    style: 'modern',
    origin: '',
    startsWith: '',
    count: 5
  });
  const [remaining, setRemaining] = useState<number | null>(null);

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    setError(null);
    // Refresh remaining generations
    handleGenerate();
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('API URL:', process.env.REACT_APP_API_URL); // Debug log
      
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('sessionId', sessionId);
      }

      const response = await axios.post('https://service-production-ddb7.up.railway.app/api/v1/names/generate', {
        ...criteria,
        sessionId
      });

      console.log('Response:', response.data); // Debug log

      if (response.data.success) {
        setNames(response.data.data.names);
        setRemaining(response.data.data.remaining);
      } else {
        if (response.data.data?.upgrade) {
          setError(
            `You've reached your daily limit of free generations. 
             Upgrade to Pro for ${response.data.data.resetIn > 0 
               ? `unlimited generations! (Free tier resets in ${Math.ceil(response.data.data.resetIn / 3600)} hours)`
               : 'unlimited generations!'}`
          );
        } else {
          setError(response.data.error);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        const resetTime = err.response.data.data?.resetIn || 24 * 60 * 60;
        const hoursRemaining = Math.ceil(resetTime / 3600);
        setError(
          `Daily limit reached! 🌟 Upgrade to Pro for unlimited generations. 
           Free tier resets in ${hoursRemaining} ${hoursRemaining === 1 ? 'hour' : 'hours'}.`
        );
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Baby Name Generator</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={criteria.gender}
              onChange={(e) => setCriteria({ ...criteria, gender: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="neutral">Any</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={criteria.style}
              onChange={(e) => setCriteria({ ...criteria, style: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="unique">Unique</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin
            </label>
            <input
              type="text"
              value={criteria.origin}
              onChange={(e) => setCriteria({ ...criteria, origin: e.target.value })}
              placeholder="e.g., French, Japanese, etc."
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starts With
            </label>
            <input
              type="text"
              value={criteria.startsWith}
              onChange={(e) => setCriteria({ ...criteria, startsWith: e.target.value })}
              placeholder="Enter a letter or prefix"
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Names'}
        </button>
        
        <div className="flex items-center justify-between mt-2">
          {remaining !== null && (
            <p className="text-sm text-gray-600">
              {remaining} generations remaining today
            </p>
          )}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Upgrade to Pro ✨
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6 flex flex-col items-center">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full 
                     hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all"
          >
            Upgrade to Pro 🚀
          </button>
        </div>
      )}

      {names.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {names.map((name, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-2">{name.name}</h3>
              {name.meaning && (
                <p className="text-gray-600 text-sm mb-1">
                  Meaning: {name.meaning}
                </p>
              )}
              {name.origin && (
                <p className="text-gray-600 text-sm">
                  Origin: {name.origin}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}; 