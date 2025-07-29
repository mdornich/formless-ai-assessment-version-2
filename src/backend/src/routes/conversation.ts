import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { conversationEngine } from '../services/conversationEngine';
import { supabaseService } from '../services/supabase';
import { logger } from '../utils/logger';

const router = Router();

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// POST /api/conversation/:assessmentId/message
// Send a message in the conversation
router.post('/:assessmentId/message',
  [
    param('assessmentId').isUUID(),
    body('message').isString().trim().isLength({ min: 1, max: 2000 })
  ],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { assessmentId } = req.params;
      const { message } = req.body;

      if (!assessmentId) {
        res.status(400).json({ success: false, message: 'Assessment ID is required' });
        return;
      }

      // Check if assessment exists and is in progress
      const assessment = await supabaseService.getAssessment(assessmentId);
      if (!assessment) {
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      if (assessment.status !== 'in_progress') {
        res.status(400).json({
          success: false,
          message: 'Assessment is not in progress'
        });
        return;
      }

      // Continue the conversation
      const response = await conversationEngine.continueConversation(assessmentId, message);

      // Emit to socket for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.to(assessmentId).emit('message_received', {
          assessmentId,
          userMessage: message,
          aiResponse: response,
          timestamp: new Date().toISOString()
        });

        if (response.is_complete) {
          io.to(assessmentId).emit('assessment_completed', {
            assessmentId,
            finalSummary: response.final_summary
          });
        }
      }

      logger.info('Conversation message processed', { 
        assessmentId,
        messageLength: message.length,
        isComplete: response.is_complete
      });

      res.json({
        success: true,
        data: {
          response,
          isComplete: response.is_complete,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error processing conversation message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message'
      });
    }
  }
);

// GET /api/conversation/:assessmentId/context
// Get current conversation context and competency indicators
router.get('/:assessmentId/context',
  [param('assessmentId').isUUID()],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { assessmentId } = req.params;

      if (!assessmentId) {
        res.status(400).json({ success: false, message: 'Assessment ID is required' });
        return;
      }

      const context = await conversationEngine.getConversationContext(assessmentId);
      if (!context) {
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          assessmentId: context.assessmentId,
          conversationLength: context.conversationHistory.length,
          competencyIndicators: context.competencyIndicators,
          currentLevel: context.currentLevel,
          lastMessage: context.conversationHistory[context.conversationHistory.length - 1]
        }
      });
    } catch (error) {
      logger.error('Error fetching conversation context:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation context'
      });
    }
  }
);

// POST /api/conversation/:assessmentId/restart
// Restart a conversation (for testing purposes)
router.post('/:assessmentId/restart',
  [param('assessmentId').isUUID()],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { assessmentId } = req.params;

      if (!assessmentId) {
        res.status(400).json({ success: false, message: 'Assessment ID is required' });
        return;
      }

      const assessment = await supabaseService.getAssessment(assessmentId);
      if (!assessment) {
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      if (assessment.status === 'completed') {
        res.status(400).json({
          success: false,
          message: 'Cannot restart completed assessment'
        });
        return;
      }

      // Reset the assessment
      await supabaseService.updateAssessment(assessmentId, {
        status: 'in_progress',
        conversation_data: [],
        competency_level: undefined,
        competency_label: undefined,
        final_summary: undefined,
        completed_at: undefined,
        metadata: {
          ...assessment.metadata,
          restarted_at: new Date().toISOString()
        }
      });

      // Start a new conversation
      const initialResponse = await conversationEngine.startConversation(assessmentId, assessment.user_id);

      // Emit to socket
      const io = req.app.get('io');
      if (io) {
        io.to(assessmentId).emit('conversation_restarted', {
          assessmentId,
          firstQuestion: initialResponse.next_question
        });
      }

      logger.info('Conversation restarted', { assessmentId });

      res.json({
        success: true,
        data: {
          message: 'Conversation restarted',
          firstQuestion: initialResponse.next_question
        }
      });
    } catch (error) {
      logger.error('Error restarting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restart conversation'
      });
    }
  }
);

// GET /api/conversation/starter-questions
// Get available starter questions (for admin/testing)
router.get('/starter-questions', async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await supabaseService.getStarterQuestions();

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    logger.error('Error fetching starter questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch starter questions'
    });
  }
});

// GET /api/conversation/health
// Health check for conversation service
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseHealthy = await supabaseService.testConnection();
    const geminiHealthy = await import('../services/gemini').then(m => m.geminiService.testConnection());
    
    res.json({
      success: true,
      data: {
        service: 'conversation',
        supabase: supabaseHealthy,
        gemini: geminiHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Conversation health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service unhealthy'
    });
  }
});

export default router;