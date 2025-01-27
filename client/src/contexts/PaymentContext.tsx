import React, { createContext, useContext, useState } from 'react';

interface PaymentContextType {
  isProcessing: boolean;
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
  startPayment: () => void;
  endPayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  const startPayment = () => setIsProcessing(true);
  const endPayment = () => setIsProcessing(false);

  return (
    <PaymentContext.Provider 
      value={{ 
        isProcessing, 
        promoCode, 
        setPromoCode, 
        startPayment, 
        endPayment 
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 