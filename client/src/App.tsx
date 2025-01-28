import React from 'react';
import { NameGenerator } from './components/NameGenerator';
import { Route, Routes } from 'react-router-dom';
import { UpgradeComplete } from './components/UpgradeComplete';
import { UpgradeSuccess } from './components/UpgradeSuccess';
import { UpgradeFailed } from './components/UpgradeFailed';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<NameGenerator />} />
        <Route path="/upgrade/complete" element={<UpgradeComplete />} />
        <Route path="/upgrade/success" element={<UpgradeSuccess />} />
        <Route path="/upgrade/failed" element={<UpgradeFailed />} />
      </Routes>
    </div>
  );
}

export default App; 