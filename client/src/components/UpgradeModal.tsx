import React, { useState } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    Omise: any;
  }
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormElements extends HTMLFormControlsCollection {
  name: HTMLInputElement;
  number: HTMLInputElement;
  month: HTMLInputElement;
  year: HTMLInputElement;
  cvc: HTMLInputElement;
}

interface UpgradeFormElement extends HTMLFormElement {
  readonly elements: FormElements;
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

  const handleSubmit = async (e: React.FormEvent<UpgradeFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const form = e.currentTarget;
      const card = {
        name: form.elements.name.value,
        number: form.elements.number.value,
        expiration_month: form.elements.month.value,
        expiration_year: form.elements.year.value,
        security_code: form.elements.cvc.value
      };

      window.Omise.setPublicKey(process.env.REACT_APP_OMISE_PUBLIC_KEY!);
      
      const { token } = await window.Omise.createToken('card', card);
      await handleUpgrade(token);
    } catch (err) {
      setError('Invalid card details');
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Holder Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              name="number"
              required
              pattern="[0-9]{16}"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Month</label>
              <input
                type="text"
                name="month"
                required
                pattern="[0-9]{2}"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="text"
                name="year"
                required
                pattern="[0-9]{2}"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CVC</label>
              <input
                type="text"
                name="cvc"
                required
                pattern="[0-9]{3,4}"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 