import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { supabaseService } from '../services/supabase';
import { conversationEngine } from '../services/conversationEngine';
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

// GET /api/assessment/health - MUST be before /:id route
// Health check for assessment service
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseHealthy = await supabaseService.testConnection();
    
    res.json({
      success: true,
      data: {
        service: 'assessment',
        supabase: supabaseHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Assessment health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service unhealthy'
    });
  }
});

// POST /api/assessment/start
// Start a new assessment
router.post('/start',
  [
    body('user_name').optional().isString().trim(),
    body('user_email').optional().isEmail().normalizeEmail(),
    body('user_company').optional().isString().trim(),
    body('user_role').optional().isString().trim(),
    body('assessment_type').isIn(['business_owner_competency', 'business_ai_readiness'])
  ],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        user_name,
        user_email,
        user_company,
        user_role,
        assessment_type
      } = req.body;

      logger.info('Starting assessment with type:', { assessment_type });

      // Create new conversation (assessment session)
      const conversationId = uuidv4();
      logger.info('Creating conversation with ID:', { conversationId });
      
      const conversation = await supabaseService.createConversation({
        id: conversationId,
        assessment_type,
        status: 'active'
      });

      // Start the conversation
      const initialResponse = await conversationEngine.startConversation(conversation.id);

      // Emit to socket if available
      const io = req.app.get('io');
      if (io) {
        io.to(conversation.id).emit('assessment_started', {
          assessmentId: conversation.id,
          firstQuestion: initialResponse.next_question
        });
      }

      logger.info('Assessment started', { 
        conversationId: conversation.id,
        assessmentType: assessment_type
      });

      res.status(201).json({
        success: true,
        data: {
          assessmentId: conversation.id,
          firstQuestion: initialResponse.next_question,
          status: 'started'
        }
      });
    } catch (error) {
      logger.error('Error starting assessment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start assessment',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  }
);

// GET /api/assessment/:id
// Get assessment details
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Assessment ID is required' });
        return;
      }

      const conversation = await supabaseService.getConversation(id);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      // Get message count for the conversation
      const messages = await supabaseService.getMessages(id);
      
      // Return conversation info as assessment data
      const publicAssessment = {
        id: conversation.id,
        status: conversation.status,
        assessment_type: conversation.assessment_type,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        conversation_length: messages.length
      };

      res.json({
        success: true,
        data: publicAssessment
      });
    } catch (error) {
      logger.error('Error fetching assessment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assessment'
      });
    }
  }
);

// GET /api/assessment/:id/conversation
// Get conversation history (for authenticated users)
router.get('/:id/conversation',
  [param('id').isUUID()],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Assessment ID is required' });
        return;
      }

      const conversation = await supabaseService.getConversation(id);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      const messages = await supabaseService.getMessages(id);

      res.json({
        success: true,
        data: {
          assessmentId: conversation.id,
          conversationHistory: messages,
          status: conversation.status,
          assessment_type: conversation.assessment_type
        }
      });
    } catch (error) {
      logger.error('Error fetching conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation'
      });
    }
  }
);

// POST /api/assessment/:id/abandon
// Mark assessment as abandoned
router.post('/:id/abandon',
  [param('id').isUUID()],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Assessment ID is required' });
        return;
      }

      const conversation = await supabaseService.getConversation(id);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      if (conversation.status === 'completed') {
        res.status(400).json({
          success: false,
          message: 'Cannot abandon completed assessment'
        });
        return;
      }

      await supabaseService.updateConversation(id, {
        status: 'abandoned'
      });

      // Emit to socket
      const io = req.app.get('io');
      if (io) {
        io.to(id).emit('assessment_abandoned', { assessmentId: id });
      }

      logger.info('Assessment abandoned', { assessmentId: id });

      res.json({
        success: true,
        message: 'Assessment marked as abandoned'
      });
    } catch (error) {
      logger.error('Error abandoning assessment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to abandon assessment'
      });
    }
  }
);

export default router;