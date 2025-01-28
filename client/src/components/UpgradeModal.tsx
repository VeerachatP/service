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
        image: 'https://via.placeholder.com/128',
        frameLabel: 'Baby Name Generator Pro',
        submitLabel: 'Pay $3.99',
        currency: 'USD',
        buttonLabel: 'Pay $3.99',
        location: 'no',
        defaultPaymentMethod: 'credit_card',
        amount: 399, // $3.99 in cents
      });
    }
  }, []);

  const handleOmiseCard = () => {
    setLoading(true);
    setError(null);

    // Create form for handling 3D Secure
    const form = document.createElement('form');
    form.id = 'omiseForm';
    form.method = 'POST';
    form.style.display = 'none';
    document.body.appendChild(form);

    // Configure the card form
    window.OmiseCard.configure({
      defaultPaymentMethod: 'credit_card',
      otherPaymentMethods: [],
    });

    // Initialize the card form
    window.OmiseCard.open({
      amount: 399,
      currency: 'USD',
      frameDescription: 'Baby Name Generator Pro Subscription',
      submitFormTarget: '#omiseForm',
      onCreateTokenSuccess: async (token: string) => {
        try {
          const sessionId = localStorage.getItem('sessionId');
          if (!sessionId) {
            throw new Error('Session not found');
          }

          const response = await axios.post('https://service-production-ddb7.up.railway.app/api/v1/upgrade', {
            token,
            sessionId,
            return_uri: window.location.origin + '/upgrade/complete'
          });

          // Handle 3D Secure redirect
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
        document.body.removeChild(form);
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