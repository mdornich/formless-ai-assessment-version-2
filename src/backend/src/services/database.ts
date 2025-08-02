import { supabase } from '../config/supabase';

export interface Message {
  id: number;
  conversation_id: string;
  sender: 'user' | 'system';
  message_text: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id?: string;
  assessment_type: string;
  status: string;
  instruction_id?: string;
}

export interface InstructionLibrary {
  id: string;
  name: string;
  use_case: string;
  prompt_text: string;
  tone?: string;
  question_bank?: any;
}

export class DatabaseService {
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  async addMessage(conversationId: string, sender: 'user' | 'system', messageText: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender,
        message_text: messageText
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    return data;
  }

  async getInstructions(useCase: string): Promise<InstructionLibrary | null> {
    const { data, error } = await supabase
      .from('instructions_library')
      .select('*')
      .eq('use_case', useCase)
      .single();

    if (error) {
      console.error('Error fetching instructions:', error);
      return null;
    }

    return data;
  }

  async updateConversationStatus(conversationId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation status:', error);
    }
  }

  async createAssessment(conversationId: string, summaryText: string): Promise<void> {
    const { error } = await supabase
      .from('assessments')
      .insert({
        conversation_id: conversationId,
        summary_text: summaryText
      });

    if (error) {
      console.error('Error creating assessment:', error);
    }
  }

  async createConversation(conversationId: string, assessmentType: string = 'ai-readiness'): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          assessment_type: assessmentType,
          status: 'in_progress',
          current_step: 0,
          instruction_id: null, // Allow null for demo purposes
          user_id: null // Allow null for demo purposes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation - Full error:', JSON.stringify(error, null, 2));
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception creating conversation:', err);
      return null;
    }
  }
}

export const databaseService = new DatabaseService();