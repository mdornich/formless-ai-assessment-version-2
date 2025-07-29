import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

export interface Conversation {
  id: string;
  user_id?: string;
  assessment_type: 'business_owner_competency' | 'business_ai_readiness';
  status: 'active' | 'completed' | 'abandoned';
  current_step?: number;
  instruction_id?: string;
  session_token?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  message_text: string;
  created_at: Date;
}

export interface Assessment {
  id: string;
  conversation_id: string;
  summary_text?: string;
  score_json?: Record<string, any>;
  requires_review?: boolean;
  reviewed?: boolean;
  reviewer_notes?: string;
  created_at: Date;
  reviewed_at?: Date;
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
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables are required');
    }

    logger.info('Initializing Supabase client', { 
      url: supabaseUrl,
      keyLength: supabaseKey?.length,
      keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'
    });

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async createConversation(conversationData: Partial<Conversation>): Promise<Conversation> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .insert([{
          ...conversationData,
          created_at: new Date(),
          updated_at: new Date()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating conversation:', {
          error,
          conversationData,
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw new Error(`Failed to create conversation: ${error.message}`);
      }

      logger.info('Conversation created successfully', { conversationId: data.id });
      return data as Conversation;
    } catch (error) {
      logger.error('Error in createConversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Conversation not found
        }
        logger.error('Error fetching conversation:', error);
        throw new Error('Failed to fetch conversation');
      }

      return data as Conversation;
    } catch (error) {
      logger.error('Error in getConversation:', error);
      throw error;
    }
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating conversation:', error);
        throw new Error('Failed to update conversation');
      }

      logger.info('Conversation updated successfully', { conversationId });
      return data as Conversation;
    } catch (error) {
      logger.error('Error in updateConversation:', error);
      throw error;
    }
  }

  async addMessage(messageData: Partial<Message>): Promise<Message> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert([{
          ...messageData,
          created_at: new Date()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error adding message:', {
          error,
          messageData,
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw new Error(`Failed to add message: ${error.message}`);
      }

      logger.info('Message added successfully', { messageId: data.id });
      return data as Message;
    } catch (error) {
      logger.error('Error in addMessage:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
      }

      return data as Message[];
    } catch (error) {
      logger.error('Error in getMessages:', error);
      throw error;
    }
  }

  async createAssessment(assessmentData: Partial<Assessment>): Promise<Assessment> {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .insert([{
          ...assessmentData,
          created_at: new Date()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating final assessment:', error);
        throw new Error('Failed to create final assessment');
      }

      logger.info('Final assessment created successfully', { assessmentId: data.id });
      return data as Assessment;
    } catch (error) {
      logger.error('Error in createAssessment:', error);
      throw error;
    }
  }

  async getStarterQuestions(): Promise<StarterQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('instructions_library')
        .select('starter_questions, use_case')
        .eq('use_case', 'business_owner_competency')
        .single();

      if (error) {
        logger.error('Error fetching starter questions:', error);
        return [
          {
            id: '1',
            question: 'How would you describe your current understanding of artificial intelligence and its business applications?',
            category: 'foundation_knowledge'
          }
        ];
      }

      return data.starter_questions.map((q: string, index: number) => ({
        id: (index + 1).toString(),
        question: q,
        category: 'foundation_knowledge'
      }));
    } catch (error) {
      logger.error('Error in getStarterQuestions:', error);
      return [
        {
          id: '1',
          question: 'How would you describe your current understanding of artificial intelligence and its business applications?',
          category: 'foundation_knowledge'
        }
      ];
    }
  }

  async getRandomStarterQuestion(): Promise<StarterQuestion> {
    const questions = await this.getStarterQuestions();
    if (questions.length === 0) {
      return {
        id: '1',
        question: 'How would you describe your current understanding of artificial intelligence and its business applications?',
        category: 'foundation_knowledge'
      };
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];
    // TypeScript safety check - this should never happen but satisfies the compiler
    if (!selectedQuestion) {
      return {
        id: '1',
        question: 'How would you describe your current understanding of artificial intelligence and its business applications?',
        category: 'foundation_knowledge'
      };
    }
    return selectedQuestion;
  }

  // Legacy method for conversation engine compatibility
  async getAssessment(conversationId: string): Promise<Conversation | null> {
    return this.getConversation(conversationId);
  }

  // Add message to conversation (used by conversation engine)
  async addConversationMessage(conversationId: string, message: any): Promise<void> {
    await this.addMessage({
      conversation_id: conversationId,
      sender: message.role === 'user' ? 'user' : 'assistant',
      message_text: message.content
    });
  }

  // Complete assessment by updating conversation status and creating final assessment
  async completeAssessment(conversationId: string, competencyLevel: number, summary: string): Promise<void> {
    // Update conversation to completed
    await this.updateConversation(conversationId, {
      status: 'completed'
    });

    // Create final assessment record
    await this.createAssessment({
      conversation_id: conversationId,
      summary_text: summary,
      score_json: { competency_level: competencyLevel }
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
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