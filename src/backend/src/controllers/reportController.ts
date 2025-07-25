import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { reportGenerationLimiter } from '../middleware/rateLimiter';
import reportGenerationService from '../services/reportGenerationService';
import { ReportGenerationRequest } from '../types/assessment';

const router = Router();

// Validation middleware for report generation
const validateReportRequest = [
  body('conversation_id')
    .isUUID()
    .withMessage('conversation_id must be a valid UUID'),
  body('assessment_type')
    .isIn(['business_ai_readiness', 'business_owner_competency'])
    .withMessage('assessment_type must be either business_ai_readiness or business_owner_competency'),
  body('user_context.name')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Name must be a string with max 100 characters'),
  body('user_context.industry')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Industry must be a string with max 100 characters'),
  body('user_context.company_size')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Company size must be a string with max 50 characters'),
  body('user_context.role')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Role must be a string with max 100 characters')
];

/**
 * POST /api/reports/generate
 * Generate an AI competency assessment report based on conversation data
 */
router.post('/generate', 
  reportGenerationLimiter,
  validateReportRequest,
  asyncHandler(async (req: Request, res: Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const reportRequest: ReportGenerationRequest = {
      conversation_id: req.body.conversation_id,
      assessment_type: req.body.assessment_type,
      user_context: req.body.user_context
    };

    try {
      const report = await reportGenerationService.generateReport(reportRequest);
      
      res.status(200).json({
        success: true,
        data: {
          report: report,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate assessment report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * GET /api/reports/:conversation_id
 * Retrieve an existing assessment report for a conversation
 */
router.get('/:conversation_id',
  asyncHandler(async (req: Request, res: Response) => {
    const { conversation_id } = req.params;

    if (!conversation_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversation_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation_id format'
      });
    }

    try {
      const report = await reportGenerationService.getExistingReport(conversation_id);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Assessment report not found for this conversation'
        });
      }

      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('Error retrieving report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assessment report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * GET /api/reports/:conversation_id/status
 * Check if a report exists and get basic info
 */
router.get('/:conversation_id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { conversation_id } = req.params;

    if (!conversation_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversation_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation_id format'
      });
    }

    try {
      const status = await reportGenerationService.getReportStatus(conversation_id);
      
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error checking report status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check report status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

export default router;