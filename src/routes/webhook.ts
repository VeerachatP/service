import express from 'express';
import { WebhookService } from '../services/webhook';
import { config } from '../config/env';

const router = express.Router();
const webhookService = new WebhookService();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['omise-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Omise signature'
      });
    }

    // Verify webhook signature
    const payload = req.body.toString();
    const isValid = webhookService.verifySignature(payload, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Parse and handle the event
    const event = JSON.parse(payload);
    await webhookService.handleEvent(event);

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

export default router; 