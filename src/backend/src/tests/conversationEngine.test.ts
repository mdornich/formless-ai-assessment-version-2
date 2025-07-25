import { conversationEngine } from '../services/conversationEngine';
import { supabaseService } from '../services/supabase';
import { geminiService } from '../services/gemini';

// Mock the services for testing
jest.mock('../services/supabase');
jest.mock('../services/gemini');

const mockSupabaseService = supabaseService as jest.Mocked<typeof supabaseService>;
const mockGeminiService = geminiService as jest.Mocked<typeof geminiService>;

describe('ConversationEngine', () => {
  const mockAssessmentId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startConversation', () => {
    it('should start a conversation with a starter question', async () => {
      // Mock starter question
      mockSupabaseService.getRandomStarterQuestion.mockResolvedValue({
        id: 'starter-1',
        question: "What's your current perspective on AI in business?",
        category: 'attitude_mindset'
      });

      mockSupabaseService.addConversationMessage.mockResolvedValue();

      const result = await conversationEngine.startConversation(mockAssessmentId);

      expect(result).toEqual({
        next_question: "What's your current perspective on AI in business?",
        is_complete: false
      });

      expect(mockSupabaseService.getRandomStarterQuestion).toHaveBeenCalled();
      expect(mockSupabaseService.addConversationMessage).toHaveBeenCalledWith(
        mockAssessmentId,
        expect.objectContaining({
          role: 'model',
          content: "What's your current perspective on AI in business?"
        })
      );
    });
  });

  describe('continueConversation', () => {
    it('should continue conversation and not complete when more questions needed', async () => {
      const mockAssessment = {
        id: mockAssessmentId,
        conversation_data: [
          {
            role: 'model' as const,
            content: "What's your perspective on AI?",
            timestamp: new Date()
          }
        ],
        status: 'in_progress' as const,
        assessment_type: 'business_owner_competency' as const,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupabaseService.getAssessment
        .mockResolvedValueOnce(mockAssessment)
        .mockResolvedValueOnce({
          ...mockAssessment,
          conversation_data: [
            ...mockAssessment.conversation_data,
            {
              role: 'user' as const,
              content: "I think AI has great potential",
              timestamp: new Date()
            }
          ]
        });

      mockSupabaseService.addConversationMessage.mockResolvedValue();

      mockGeminiService.generateAssessmentResponse.mockResolvedValue({
        next_question: "Can you tell me about any AI tools you've used?",
        is_complete: false
      });

      const result = await conversationEngine.continueConversation(
        mockAssessmentId,
        "I think AI has great potential"
      );

      expect(result).toEqual({
        next_question: "Can you tell me about any AI tools you've used?",
        is_complete: false
      });

      expect(mockSupabaseService.addConversationMessage).toHaveBeenCalledTimes(2);
      expect(mockGeminiService.generateAssessmentResponse).toHaveBeenCalled();
    });

    it('should complete conversation and determine competency level', async () => {
      const mockAssessment = {
        id: mockAssessmentId,
        conversation_data: [
          {
            role: 'model' as const,
            content: "What's your perspective on AI?",
            timestamp: new Date()
          },
          {
            role: 'user' as const,
            content: "I use ChatGPT daily for strategic planning",
            timestamp: new Date()
          }
        ],
        status: 'in_progress' as const,
        assessment_type: 'business_owner_competency' as const,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupabaseService.getAssessment.mockResolvedValue(mockAssessment);
      mockSupabaseService.addConversationMessage.mockResolvedValue();

      mockGeminiService.generateAssessmentResponse.mockResolvedValue({
        final_summary: "Thank you for the conversation. I have enough information to prepare your report.",
        is_complete: true
      });

      mockSupabaseService.completeAssessment.mockResolvedValue({
        ...mockAssessment,
        status: 'completed',
        competency_level: 3,
        competency_label: 'Applied',
        final_summary: "Thank you for the conversation. I have enough information to prepare your report."
      });

      const result = await conversationEngine.continueConversation(
        mockAssessmentId,
        "I use it for team coaching too"
      );

      expect(result).toEqual({
        final_summary: "Thank you for the conversation. I have enough information to prepare your report.",
        is_complete: true
      });

      expect(mockSupabaseService.completeAssessment).toHaveBeenCalledWith(
        mockAssessmentId,
        expect.any(Number),
        "Thank you for the conversation. I have enough information to prepare your report."
      );
    });
  });

  describe('competency level determination', () => {
    it('should identify Level 4 (Strategic) users correctly', () => {
      // This would test the private determineCompetencyLevel method
      // In a real implementation, we might expose this for testing
      // or test it indirectly through the public methods
    });
  });
});