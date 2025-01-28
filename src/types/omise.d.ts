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