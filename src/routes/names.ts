import express from 'express';
import { OpenAIService } from '../services/openai';
import { SessionService } from '../services/session';

const router = express.Router();
const openAIService = new OpenAIService();
const sessionService = new SessionService();

router.post('/generate', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const remaining = await sessionService.getRemainingGenerations(sessionId);
    if (remaining <= 0) {
      return res.status(403).json({
        success: false,
        error: 'Generation limit reached',
        upgrade: true
      });
    }

    const canGenerate = await sessionService.incrementGenerations(sessionId);
    if (!canGenerate) {
      return res.status(403).json({
        success: false,
        error: 'Generation limit reached',
        upgrade: true
      });
    }

    const names = await openAIService.generateNames(req.body);
    
    res.json({
      success: true,
      data: {
        names,
        remaining: remaining - 1
      }
    });
  } catch (error) {
    console.error('Name generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate names'
    });
  }
});

export default router; 