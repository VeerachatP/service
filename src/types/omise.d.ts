declare module 'omise' {
  interface OmiseStatic {
    (config: { publicKey: string; secretKey: string }): Omise;
  }

  interface Omise {
    charges: {
      create(data: {
        amount: number;
        currency: string;
        card?: string;
        customer?: string;
        description?: string;
        capture?: boolean;
        metadata?: Record<string, any>;
      }): Promise<Charge>;
      retrieve(id: string): Promise<Charge>;
    };
    customers: {
      create(data: {
        email: string;
        description?: string;
        card?: string;
      }): Promise<Customer>;
    };
  }

  interface Charge {
    id: string;
    amount: number;
    currency: string;
    status: string;
    customer: string;
    metadata: Record<string, any>;
    paid: boolean;
    transaction: string;
    failure_code?: string;
    failure_message?: string;
  }

  interface Customer {
    id: string;
    email: string;
    description: string;
    cards: any;
  }

  const omise: OmiseStatic;
  export = omise;
} 