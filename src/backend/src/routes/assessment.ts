import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { supabaseService } from '../services/supabase';
import { conversationEngine } from '../services/conversationEngine';
import { logger } from '../utils/logger';

const router = Router();

// Validation middleware
const validateRequest = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

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
  async (req: Request, res: Response) => {
    try {
      const {
        user_name,
        user_email,
        user_company,
        user_role,
        assessment_type
      } = req.body;

      // Create new assessment
      const assessment = await supabaseService.createAssessment({
        id: uuidv4(),
        user_name,
        user_email,
        user_company,
        user_role,
        assessment_type,
        status: 'in_progress',
        conversation_data: [],
        metadata: {
          started_at: new Date().toISOString(),
          user_agent: req.headers['user-agent'],
          ip_address: req.ip
        }
      });

      // Start the conversation
      const initialResponse = await conversationEngine.startConversation(assessment.id);

      // Emit to socket if available
      const io = req.app.get('io');
      if (io) {
        io.to(assessment.id).emit('assessment_started', {
          assessmentId: assessment.id,
          firstQuestion: initialResponse.next_question
        });
      }

      logger.info('Assessment started', { 
        assessmentId: assessment.id,
        assessmentType: assessment_type,
        userEmail: user_email 
      });

      res.status(201).json({
        success: true,
        data: {
          assessmentId: assessment.id,
          firstQuestion: initialResponse.next_question,
          status: 'started'
        }
      });
    } catch (error) {
      logger.error('Error starting assessment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start assessment'
      });
    }
  }
);

// GET /api/assessment/:id
// Get assessment details
router.get('/:id',
  [param('id').isUUID()],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const assessment = await supabaseService.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      // Remove sensitive conversation data for privacy
      const publicAssessment = {
        id: assessment.id,
        status: assessment.status,
        competency_level: assessment.competency_level,
        competency_label: assessment.competency_label,
        created_at: assessment.created_at,
        completed_at: assessment.completed_at,
        conversation_length: assessment.conversation_data.length
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
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const context = await conversationEngine.getConversationContext(id);
      if (!context) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      res.json({
        success: true,
        data: {
          assessmentId: context.assessmentId,
          conversationHistory: context.conversationHistory,
          competencyIndicators: context.competencyIndicators,
          currentLevel: context.currentLevel
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
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const assessment = await supabaseService.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      if (assessment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot abandon completed assessment'
        });
      }

      await supabaseService.updateAssessment(id, {
        status: 'abandoned',
        metadata: {
          ...assessment.metadata,
          abandoned_at: new Date().toISOString()
        }
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

// GET /api/assessment/health
// Health check for assessment service
router.get('/health', async (req: Request, res: Response) => {
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

export default router;