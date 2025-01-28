import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const UpgradeSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <div className="text-green-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
        <p className="mb-4">Your account has been upgraded to Pro.</p>
        <p className="text-sm text-gray-500">Redirecting to home page...</p>
      </div>
    </div>
  );
}; 