import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validatePromoCode = [
  body('code')
    .isString()
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Invalid promo code format'),
  
  body('type')
    .isIn(['GENERAL', 'VIP', 'INFLUENCER'])
    .withMessage('Invalid promo code type'),
  
  body('campaignSource')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Campaign source too long'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
]; 