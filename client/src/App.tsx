import React from 'react';
import { NameGenerator } from './components/NameGenerator';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { UpgradeComplete } from './components/UpgradeComplete';
import { UpgradeSuccess } from './components/UpgradeSuccess';
import { UpgradeFailed } from './components/UpgradeFailed';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<NameGenerator />} />
          <Route path="/upgrade/complete" element={<UpgradeComplete />} />
          <Route path="/upgrade/success" element={<UpgradeSuccess />} />
          <Route path="/upgrade/failed" element={<UpgradeFailed />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App; 