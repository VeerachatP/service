import React, { useState } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    OmiseCard: any;
  }
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Wait for Omise to be fully loaded
      const initOmise = () => {
        if (window.OmiseCard) {
          window.OmiseCard.configure({
            publicKey: process.env.REACT_APP_OMISE_PUBLIC_KEY,
            frameLabel: 'Baby Name Generator Pro',
            submitLabel: 'Pay $9.99',
            buttonLabel: 'Pay $9.99',
            location: 'yes',
            submitFormTarget: '_self'
          });
        } else {
          // Retry after a short delay
          setTimeout(initOmise, 100);
        }
      };

      initOmise();
    }
  }, [isOpen]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) throw new Error('Session not found');

      console.log('Payment Attempt:', {
        sessionId,
        hasOmise: !!window.OmiseCard,
        apiUrl: process.env.REACT_APP_API_URL
      });

      window.OmiseCard.open({
        amount: 999,
        currency: 'USD',
        defaultPaymentMethod: 'credit_card',
        submitFormTarget: '_self',
        onCreateTokenSuccess: async (token: string) => {
          console.log('Token Created:', { token: token.substring(0, 10) + '...' });
          try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/upgrade`, {
              token,
              sessionId
            });
            console.log('Payment Response:', response.data);

            if (response.data.success) {
              onSuccess();
            } else if (response.data.authorizeUri) {
              // Redirect to 3D Secure authentication
              window.location.href = response.data.authorizeUri;
            } else {
              setError(response.data.error || 'Payment failed');
            }
          } catch (err) {
            setError('Failed to process payment');
          }
        },
        onFormClosed: () => {
          setLoading(false);
        }
      });
    } catch (err) {
      setError('Failed to initialize payment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Pro Benefits:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>50 name generations per day</li>
            <li>Priority support</li>
            <li>Advanced name meanings</li>
            <li>Cultural insights</li>
          </ul>
          <p className="mt-4 text-2xl font-bold">$9.99/month</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </div>
  );
}; 