import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { ConversationMessage } from './gemini';

export interface Assessment {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_company?: string;
  user_role?: string;
  assessment_type: 'business_owner_competency' | 'business_ai_readiness';
  status: 'in_progress' | 'completed' | 'abandoned';
  competency_level?: 1 | 2 | 3 | 4;
  competency_label?: 'Aware' | 'Exploratory' | 'Applied' | 'Strategic';
  final_summary?: string;
  conversation_data: ConversationMessage[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface StarterQuestion {
  id: string;
  question: string;
  category: string;
  target_level?: number;
}

class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createAssessment(assessmentData: Partial<Assessment>): Promise<Assessment> {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .insert([{
          ...assessmentData,
          created_at: new Date(),
          updated_at: new Date()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating assessment:', error);
        throw new Error('Failed to create assessment');
      }

      logger.info('Assessment created successfully', { assessmentId: data.id });
      return data as Assessment;
    } catch (error) {
      logger.error('Error in createAssessment:', error);
      throw error;
    }
  }

  async getAssessment(assessmentId: string): Promise<Assessment | null> {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Assessment not found
        }
        logger.error('Error fetching assessment:', error);
        throw new Error('Failed to fetch assessment');
      }

      return data as Assessment;
    } catch (error) {
      logger.error('Error in getAssessment:', error);
      throw error;
    }
  }

  async updateAssessment(assessmentId: string, updates: Partial<Assessment>): Promise<Assessment> {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', assessmentId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating assessment:', error);
        throw new Error('Failed to update assessment');
      }

      logger.info('Assessment updated successfully', { assessmentId });
      return data as Assessment;
    } catch (error) {
      logger.error('Error in updateAssessment:', error);
      throw error;
    }
  }

  async addConversationMessage(
    assessmentId: string, 
    message: ConversationMessage
  ): Promise<void> {
    try {
      // First, get the current conversation data
      const assessment = await this.getAssessment(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const updatedConversation = [...assessment.conversation_data, message];

      // Update the assessment with the new message
      await this.updateAssessment(assessmentId, {
        conversation_data: updatedConversation
      });

      logger.info('Conversation message added', { 
        assessmentId, 
        messageRole: message.role,
        conversationLength: updatedConversation.length 
      });
    } catch (error) {
      logger.error('Error adding conversation message:', error);
      throw error;
    }
  }

  async completeAssessment(
    assessmentId: string,
    competencyLevel: 1 | 2 | 3 | 4,
    finalSummary: string
  ): Promise<Assessment> {
    const competencyLabels = {
      1: 'Aware' as const,
      2: 'Exploratory' as const,
      3: 'Applied' as const,
      4: 'Strategic' as const
    };

    try {
      const completedAssessment = await this.updateAssessment(assessmentId, {
        status: 'completed',
        competency_level: competencyLevel,
        competency_label: competencyLabels[competencyLevel],
        final_summary: finalSummary,
        completed_at: new Date()
      });

      logger.info('Assessment completed', { 
        assessmentId, 
        competencyLevel,
        competencyLabel: competencyLabels[competencyLevel]
      });

      return completedAssessment;
    } catch (error) {
      logger.error('Error completing assessment:', error);
      throw error;
    }
  }

  async getStarterQuestions(): Promise<StarterQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('starter_questions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching starter questions:', error);
        throw new Error('Failed to fetch starter questions');
      }

      return data as StarterQuestion[];
    } catch (error) {
      logger.error('Error in getStarterQuestions:', error);
      throw error;
    }
  }

  async getRandomStarterQuestion(): Promise<StarterQuestion> {
    try {
      const questions = await this.getStarterQuestions();
      
      if (questions.length === 0) {
        // Fallback question if none in database
        return {
          id: 'fallback',
          question: "I'd like to start by understanding your current perspective on AI in business. When you think about artificial intelligence, what comes to mind first - opportunities, challenges, or something else entirely?",
          category: 'attitude_mindset'
        };
      }

      const randomIndex = Math.floor(Math.random() * questions.length);
      return questions[randomIndex];
    } catch (error) {
      logger.error('Error getting random starter question:', error);
      // Return fallback question
      return {
        id: 'fallback',
        question: "I'd like to start by understanding your current perspective on AI in business. When you think about artificial intelligence, what comes to mind first - opportunities, challenges, or something else entirely?",
        category: 'attitude_mindset'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      logger.error('Supabase connection test failed:', error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();