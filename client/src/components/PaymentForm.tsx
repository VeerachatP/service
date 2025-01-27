import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePayment } from '../contexts/PaymentContext';
import { PRICING } from '../config/constants';

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

declare const Omise: any; // Using the type from omise.d.ts

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onError }) => {
  const { promoCode, isProcessing, startPayment, endPayment } = usePayment();
  const [promoInput, setPromoInput] = useState('');

  useEffect(() => {
    // Configure Omise with your public key
    Omise.configure('YOUR_OMISE_PUBLIC_KEY');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startPayment();

    try {
      // Create Omise token
      Omise.createToken(
        'card',
        {
          amount: PRICING.PRO_PRICE * 100, // Convert to smallest currency unit
          currency: PRICING.CURRENCY,
          // Additional parameters will be handled by Omise's form
        },
        async (statusCode: number, response: any) => {
          if (statusCode !== 200) {
            onError(response.message);
            endPayment();
            return;
          }

          try {
            // Send token to your server
            const serverResponse = await axios.post('/api/upgrade', {
              omiseToken: response.id,
              promoCode: promoInput || promoCode
            });

            if (serverResponse.data.success) {
              onSuccess();
            } else {
              onError(serverResponse.data.error || 'Payment failed');
            }
          } catch (error) {
            onError(error instanceof Error ? error.message : 'Payment failed');
          } finally {
            endPayment();
          }
        }
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
      endPayment();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Promotional Code
          </label>
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter promo code (optional)"
          />
        </div>

        {/* Omise's form will be injected here */}
        <div id="omise-form" className="my-4"></div>

        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600">
            Price: ${PRICING.PRO_PRICE}
            {promoCode && <span className="text-green-600"> (Promo code applied)</span>}
          </p>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? 'Processing...' : 'Upgrade Now'}
        </button>
      </form>
    </div>
  );
}; 