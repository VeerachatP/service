import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Initialize OmiseCard with configuration
    if (window.OmiseCard) {
      window.OmiseCard.configure({
        publicKey: process.env.REACT_APP_OMISE_PUBLIC_KEY,
        frameLabel: 'Baby Name Generator Pro',
        submitLabel: 'Pay $3.99',
        currency: 'USD',
        buttonLabel: 'Pay $3.99',
        amount: 399,
        defaultPaymentMethod: 'credit_card',
        otherPaymentMethods: [],
        hideAmount: false,
        requireName: false,
        requireEmail: false,
        requireAddress: false,
        requirePostalCode: false
      });
    }
  }, []);

  const handleOmiseCard = () => {
    setLoading(true);
    setError(null);

    window.OmiseCard.open({
      frameDescription: 'Monthly Pro Subscription',
      onCreateTokenSuccess: async (token: string) => {
        try {
          const sessionId = localStorage.getItem('sessionId');
          if (!sessionId) {
            throw new Error('Session not found');
          }

          const response = await axios.post(`${process.env.REACT_APP_API_URL}/upgrade`, {
            token,
            sessionId,
            return_uri: window.location.origin + '/upgrade/complete'
          });

          if (response.data.authorizeUri) {
            window.location.href = response.data.authorizeUri;
          } else if (response.data.success) {
            onSuccess();
          }
        } catch (err) {
          setError('Payment failed. Please try again.');
          setLoading(false);
        }
      },
      onFormClosed: () => {
        setLoading(false);
      }
    });
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
          <p className="mt-4 text-2xl font-bold">$3.99/month</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleOmiseCard}
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