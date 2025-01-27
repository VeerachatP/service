declare module 'omise' {
  interface OmiseStatic {
    (config: { publicKey: string; secretKey: string }): OmiseInstance;
  }

  interface OmiseInstance {
    charges: {
      create(data: {
        amount: number;
        currency: string;
        card?: string;
        source?: string;
        customer?: string;
        description?: string;
        metadata?: Record<string, any>;
        capture?: boolean;
      }): Promise<Charge>;
    };
  }

  interface Charge {
    id: string;
    status: 'successful' | 'pending' | 'failed';
    amount: number;
    currency: string;
    description: string;
    metadata: Record<string, any>;
    card?: any;
    source?: any;
    customer?: string;
    failure_code?: string;
    failure_message?: string;
    paid: boolean;
    transaction: string;
    refunded: number;
    refunds: any;
    created: string;
  }

  const omise: OmiseStatic;
  export default omise;
} 