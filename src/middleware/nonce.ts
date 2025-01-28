import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Response {
      locals: {
        nonce: string;
      }
    }
  }
}

export const nonceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  // Set CSP header with nonce
  const csp = `default-src 'self' https://*.omise.co;
               connect-src 'self' https://*.omise.co https://api.omise.co;
               frame-src 'self' https://*.omise.co;
               script-src 'self' 'nonce-${nonce}' https://*.omise.co;
               style-src 'self' 'unsafe-inline' https://*.omise.co;
               img-src 'self' data: https://*.omise.co;`.replace(/\s+/g, ' ');

  res.setHeader('Content-Security-Policy', csp);
  next();
}; 