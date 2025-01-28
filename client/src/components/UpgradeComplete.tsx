import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const UpgradeComplete: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show loading state while processing
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
        <p className="mb-4">Please wait while we verify your payment...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}; 