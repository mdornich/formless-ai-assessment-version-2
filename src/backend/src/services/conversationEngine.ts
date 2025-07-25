import { geminiService, ConversationMessage, AssessmentResponse } from './gemini';
import { supabaseService, Assessment } from './supabase';
import { logger } from '../utils/logger';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface ConversationContext {
  assessmentId: string;
  userId?: string;
  conversationHistory: ConversationMessage[];
  competencyIndicators: CompetencyIndicators;
  currentLevel?: 1 | 2 | 3 | 4;
}

export interface CompetencyIndicators {
  mindsetSignals: string[];
  understandingSignals: string[];
  usageSignals: string[];
  visionSignals: string[];
  confidenceScore: number; // 0-100
}

class ConversationEngine {
  private systemPrompt: string;

  constructor() {
    this.loadSystemPrompt();
  }

  private loadSystemPrompt(): void {
    try {
      const promptPath = join(process.cwd(), '../../docs/prompts/business-owner-agent-v3.md');
      this.systemPrompt = readFileSync(promptPath, 'utf-8');
    } catch (error) {
      logger.warn('Could not load system prompt from file, using fallback');
      this.systemPrompt = this.getFallbackSystemPrompt();
    }
  }

  private getFallbackSystemPrompt(): string {
    return `# System Instructions v3.0: Business Leader AI Competency Agent

## Role and Purpose
You are an expert AI Literacy Coach and Diagnostic Assessor. Your primary purpose is to conduct a personalized, friendly, and insightful conversational assessment to accurately place a business leader into a specific AI competency level.

## Assessment Framework
**Level 1: Aware**
- Mindset: Cautious, skeptical, or passively curious
- Understanding: Surface-level awareness but cannot articulate core business capabilities
- Usage: No regular or meaningful use of AI tools

**Level 2: Exploratory**  
- Mindset: Open and curious, but action is inconsistent
- Understanding: Functional grasp of what common AI tools do
- Usage: Occasional, task-specific use for simple tasks

**Level 3: Applied**
- Mindset: Pragmatic and proactive, seeks to integrate AI into workflow
- Understanding: Solid grasp of how AI can augment their job functions
- Usage: Regular, consistent professional use as "thought partner"

**Level 4: Strategic**
- Mindset: Visionary and transformative, thinks beyond personal productivity
- Understanding: Deeply grasps strategic implications including data strategy and ethics
- Usage: Uses AI to model, strategize, and lead team adoption

## Output Format
Your response MUST be a single, minified JSON object:

For ongoing conversation:
{"next_question": "Your question here", "is_complete": false}

When complete:
{"final_summary": "Brief summary confirming you have enough information", "is_complete": true}`;
  }

  async startConversation(assessmentId: string, userId?: string): Promise<AssessmentResponse> {
    try {
      // Get a starter question
      const starterQuestion = await supabaseService.getRandomStarterQuestion();
      
      // Initialize conversation context
      const context: ConversationContext = {
        assessmentId,
        userId,
        conversationHistory: [],
        competencyIndicators: {
          mindsetSignals: [],
          understandingSignals: [],
          usageSignals: [],
          visionSignals: [],
          confidenceScore: 0
        }
      };

      // Create the first AI message
      const firstMessage: ConversationMessage = {
        role: 'model',
        content: starterQuestion.question,
        timestamp: new Date()
      };

      // Store the message
      await supabaseService.addConversationMessage(assessmentId, firstMessage);

      logger.info('Conversation started', { 
        assessmentId, 
        starterQuestionId: starterQuestion.id 
      });

      return {
        next_question: starterQuestion.question,
        is_complete: false
      };
    } catch (error) {
      logger.error('Error starting conversation:', error);
      throw new Error('Failed to start conversation');
    }
  }

  async continueConversation(
    assessmentId: string, 
    userInput: string
  ): Promise<AssessmentResponse> {
    try {
      // Get current assessment
      const assessment = await supabaseService.getAssessment(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Add user message to conversation history
      const userMessage: ConversationMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date()
      };

      await supabaseService.addConversationMessage(assessmentId, userMessage);

      // Get updated conversation history
      const updatedAssessment = await supabaseService.getAssessment(assessmentId);
      const conversationHistory = updatedAssessment!.conversation_data;

      // Analyze user input for competency indicators
      const competencyIndicators = this.analyzeCompetencyIndicators(userInput, conversationHistory);

      // Generate AI response using Gemini
      const aiResponse = await geminiService.generateAssessmentResponse(
        this.systemPrompt,
        conversationHistory,
        userInput
      );

      // Store AI response
      if (aiResponse.next_question) {
        const aiMessage: ConversationMessage = {
          role: 'model',
          content: aiResponse.next_question,
          timestamp: new Date()
        };
        await supabaseService.addConversationMessage(assessmentId, aiMessage);
      }

      // If conversation is complete, determine competency level and complete assessment
      if (aiResponse.is_complete && aiResponse.final_summary) {
        const competencyLevel = this.determineCompetencyLevel(conversationHistory, competencyIndicators);
        await supabaseService.completeAssessment(assessmentId, competencyLevel, aiResponse.final_summary);
        
        logger.info('Conversation completed', { 
          assessmentId, 
          competencyLevel,
          messageCount: conversationHistory.length 
        });
      }

      return aiResponse;
    } catch (error) {
      logger.error('Error continuing conversation:', error);
      throw new Error('Failed to continue conversation');
    }
  }

  private analyzeCompetencyIndicators(
    userInput: string, 
    conversationHistory: ConversationMessage[]
  ): CompetencyIndicators {
    const indicators: CompetencyIndicators = {
      mindsetSignals: [],
      understandingSignals: [],
      usageSignals: [],
      visionSignals: [],
      confidenceScore: 0
    };

    const input = userInput.toLowerCase();

    // Mindset analysis
    if (input.includes('excited') || input.includes('opportunity') || input.includes('potential')) {
      indicators.mindsetSignals.push('positive_outlook');
    }
    if (input.includes('worried') || input.includes('concerned') || input.includes('scary')) {
      indicators.mindsetSignals.push('cautious_approach');
    }
    if (input.includes('strategic') || input.includes('transform') || input.includes('competitive advantage')) {
      indicators.mindsetSignals.push('strategic_thinking');
    }

    // Understanding analysis
    if (input.includes('chatgpt') || input.includes('ai tool') || input.includes('machine learning')) {
      indicators.understandingSignals.push('tool_awareness');
    }
    if (input.includes('prompt') || input.includes('training data') || input.includes('limitations')) {
      indicators.understandingSignals.push('technical_understanding');
    }
    if (input.includes('automation') && input.includes('different from ai')) {
      indicators.understandingSignals.push('conceptual_clarity');
    }

    // Usage analysis
    if (input.includes('use daily') || input.includes('regularly') || input.includes('part of workflow')) {
      indicators.usageSignals.push('regular_usage');
    }
    if (input.includes('never used') || input.includes('haven\'t tried')) {
      indicators.usageSignals.push('no_usage');
    }
    if (input.includes('brainstorm') || input.includes('thought partner') || input.includes('critique')) {
      indicators.usageSignals.push('sophisticated_usage');
    }

    // Vision analysis
    if (input.includes('team') || input.includes('organization') || input.includes('company-wide')) {
      indicators.visionSignals.push('organizational_thinking');
    }
    if (input.includes('roi') || input.includes('business impact') || input.includes('competitive')) {
      indicators.visionSignals.push('business_impact_focus');
    }

    // Calculate confidence score based on conversation depth
    const messageCount = conversationHistory.length;
    const totalSignals = indicators.mindsetSignals.length + 
                        indicators.understandingSignals.length + 
                        indicators.usageSignals.length + 
                        indicators.visionSignals.length;
    
    indicators.confidenceScore = Math.min(100, (messageCount * 10) + (totalSignals * 5));

    return indicators;
  }

  private determineCompetencyLevel(
    conversationHistory: ConversationMessage[],
    indicators: CompetencyIndicators
  ): 1 | 2 | 3 | 4 {
    // Simple scoring algorithm - can be made more sophisticated
    let score = 1;

    // Check for Level 4 indicators (Strategic)
    if (indicators.visionSignals.includes('organizational_thinking') &&
        indicators.mindsetSignals.includes('strategic_thinking') &&
        indicators.usageSignals.includes('sophisticated_usage')) {
      score = 4;
    }
    // Check for Level 3 indicators (Applied)
    else if (indicators.usageSignals.includes('regular_usage') &&
             indicators.understandingSignals.includes('technical_understanding')) {
      score = 3;
    }
    // Check for Level 2 indicators (Exploratory)
    else if (indicators.understandingSignals.includes('tool_awareness') &&
             !indicators.usageSignals.includes('no_usage')) {
      score = 2;
    }
    // Default to Level 1 (Aware)

    logger.info('Competency level determined', { 
      score, 
      indicators,
      conversationLength: conversationHistory.length 
    });

    return score as 1 | 2 | 3 | 4;
  }

  async getConversationContext(assessmentId: string): Promise<ConversationContext | null> {
    try {
      const assessment = await supabaseService.getAssessment(assessmentId);
      if (!assessment) {
        return null;
      }

      // Analyze the conversation for competency indicators
      const latestMessage = assessment.conversation_data[assessment.conversation_data.length - 1];
      const competencyIndicators = latestMessage && latestMessage.role === 'user' 
        ? this.analyzeCompetencyIndicators(latestMessage.content, assessment.conversation_data)
        : {
            mindsetSignals: [],
            understandingSignals: [],
            usageSignals: [],
            visionSignals: [],
            confidenceScore: 0
          };

      return {
        assessmentId,
        userId: assessment.user_id,
        conversationHistory: assessment.conversation_data,
        competencyIndicators,
        currentLevel: assessment.competency_level
      };
    } catch (error) {
      logger.error('Error getting conversation context:', error);
      return null;
    }
  }
}

export const conversationEngine = new ConversationEngine();