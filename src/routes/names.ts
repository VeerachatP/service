import express from 'express';
import { OpenAIService } from '../services/openai';
import { SessionService } from '../services/session';
import { validateSessionId } from '../utils/session';

const router = express.Router();
const openAIService = new OpenAIService();
const sessionService = new SessionService();

// Test endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Names API is working' });
});

router.get('/test', (req, res) => {
  res.json({ message: 'Names test endpoint is working' });
});

router.post('/generate', async (req, res) => {
  try {
    const { sessionId, gender, style, origin, startsWith, count } = req.body;

    if (!sessionId || !validateSessionId(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Initialize session if new
    await sessionService.initSession(sessionId);

    // Check remaining generations
    const remaining = await sessionService.getRemainingGenerations(sessionId);
    if (remaining <= 0) {
      const status = await sessionService.getSessionStatus(sessionId);
      return res.status(403).json({
        success: false,
        error: 'Generation limit reached',
        data: {
          remaining: 0,
          resetIn: status.expiresIn,
          upgrade: true
        }
      });
    }

    // Increment usage and generate names
    const canGenerate = await sessionService.incrementGenerations(sessionId);
    if (!canGenerate) {
      return res.status(403).json({
        success: false,
        error: 'Failed to increment generation count'
      });
    }

    const names = await openAIService.generateNames({
      sessionId,
      gender,
      style,
      origin,
      startsWith,
      count
    });

    const status = await sessionService.getSessionStatus(sessionId);
    
    res.json({
      success: true,
      data: {
        names,
        remaining: status.remaining,
        resetIn: status.expiresIn,
        isPremium: status.isPremium
      }
    });
  } catch (error) {
    console.error('Name generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate names'
    });
  }
});

export default router; 