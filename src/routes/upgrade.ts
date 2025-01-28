import express from 'express';
import { PaymentService } from '../services/payment';
import { SessionService } from '../services/session';
import { validateSessionId } from '../utils/session';

const router = express.Router();
const paymentService = new PaymentService();
const sessionService = new SessionService();

router.post('/', async (req, res) => {
  try {
    const { token, sessionId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Payment token is required'
      });
    }

    if (!sessionId || !validateSessionId(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Process payment with Omise
    const charge = await paymentService.createCharge({
      token,
      amount: 399, // $3.99 in cents
      currency: 'usd',
      description: 'Baby Name Generator Pro Subscription',
      return_uri: req.body.return_uri,
      capture: false, // Don't capture until 3D Secure is complete
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
      // Upgrade session to premium
      await sessionService.upgradeToPremuim(sessionId);
      
      res.json({
        success: true,
        data: {
          charge: {
            id: charge.id,
            status: charge.status
          },
          subscription: {
            type: 'pro',
            expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
          }
        }
      });
    } else {
      res.status(402).json({
        success: false,
        error: 'Payment failed',
        data: {
          charge: {
            id: charge.id,
            status: charge.status,
            failureMessage: charge.failure_message
          }
        }
      });
    }
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upgrade'
    });
  }
});

router.get('/complete', async (req, res) => {
  try {
    const { chargeId } = req.query;
    
    if (!chargeId) {
      return res.status(400).json({
        success: false,
        error: 'Charge ID is required'
      });
    }

    const charge = await paymentService.retrieveCharge(chargeId as string);
    
    if (charge.paid) {
      const { sessionId } = charge.metadata;
      await sessionService.upgradeToPremuim(sessionId);
      
      // Redirect to success page
      res.redirect('/upgrade/success');
    } else {
      // Redirect to failure page
      res.redirect('/upgrade/failed');
    }
  } catch (error) {
    console.error('Upgrade completion error:', error);
    res.redirect('/upgrade/failed');
  }
});

export default router; 