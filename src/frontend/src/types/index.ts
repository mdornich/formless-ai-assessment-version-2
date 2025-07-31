// Types for the simplified v2.0 frontend

export interface Message {
  id: number;
  sender: 'user' | 'system';
  message_text: string;
  created_at: string;
}

export interface ChatRequest {
  conversation_id: string;
  user_message: string;
}

export interface ChatResponse {
  next_question?: string;
  final_summary?: string;
  is_complete: boolean;
}

export interface ConversationState {
  messages: Message[];
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}