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

  const handleUpgrade = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('Session not found');
      }

      const response = await axios.post('https://service-production-ddb7.up.railway.app/api/v1/upgrade', {
        token,
        sessionId
      });

      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openOmiseForm = () => {
    if (!window.OmiseCard) {
      setError('Payment system is not available');
      return;
    }

    setLoading(true);

    window.OmiseCard.configure({
      publicKey: process.env.REACT_APP_OMISE_PUBLIC_KEY,
      currency: 'usd',
      image: 'https://via.placeholder.com/128', // Placeholder image for now
      frameLabel: 'Baby Name Generator Pro',
      submitLabel: 'Pay $3.99',
      buttonLabel: 'Pay $3.99',
      defaultPaymentMethod: 'credit_card',
      otherPaymentMethods: [],
      amount: 399, // $3.99 in cents
    });

    window.OmiseCard.open({
      frameDescription: 'Monthly Pro Subscription',
      submitFormTarget: '#omise-form',
      onCreateTokenSuccess: (token: string) => {
        handleUpgrade(token);
      },
      onFormClosed: () => {
        setLoading(false);
      },
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
            onClick={openOmiseForm}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade Now'}
          </button>
        </div>

        {/* Add hidden form for Omise */}
        <form id="omise-form" method="POST" className="hidden">
          <input type="hidden" name="omiseToken" />
          <input type="hidden" name="omiseSource" />
        </form>
      </div>
    </div>
  );
}; 