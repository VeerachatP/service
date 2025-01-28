import express from 'express';
import { PaymentService } from '../services/payment';
import { SessionService } from '../services/session';
import { validateSessionId } from '../utils/session';

const router = express.Router();
const paymentService = new PaymentService();
const sessionService = new SessionService();

router.post('/', async (req, res) => {
  try {
    const { token, sessionId, return_uri } = req.body;

    if (!token || !sessionId || !return_uri) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    const charge = await paymentService.createCharge({
      token,
      amount: 399,
      currency: 'usd',
      description: 'Baby Name Generator Pro Subscription',
      return_uri,
      capture: false,
      metadata: {
        sessionId,
        subscriptionType: 'pro'
      }
    });

    if (charge.status === 'pending') {
      res.json({
        success: false,
        authorizeUri: charge.authorize_uri
      });
    } else if (charge.paid) {
      await sessionService.upgradeToPremuim(sessionId);
      res.json({ success: true });
    } else {
      res.status(402).json({
        success: false,
        error: charge.failure_message || 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});

router.get('/complete', async (req, res) => {
  try {
    const { chargeId } = req.query;
    
    if (!chargeId) {
      return res.redirect('/upgrade/failed');
    }

    const charge = await paymentService.retrieveCharge(chargeId as string);
    
    if (charge.status === 'successful' && charge.paid) {
      const { sessionId } = charge.metadata;
      await sessionService.upgradeToPremuim(sessionId);
      
      res.redirect('/upgrade/success');
    } else {
      res.redirect('/upgrade/failed');
    }
  } catch (error) {
    console.error('Upgrade completion error:', error);
    res.redirect('/upgrade/failed');
  }
});

export default router; 