import React, { useState } from 'react';
import { Message, ConversationState } from '@/types';
import { sendMessage } from '@/utils/api';
import MessageList from './MessageList';
import InputField from './InputField';

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages?: Message[];
}

export default function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
  const [state, setState] = useState<ConversationState>({
    messages: initialMessages,
    isComplete: false,
    isLoading: false,
    error: null,
  });

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || state.isLoading || state.isComplete) return;

    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      message_text: userMessage,
      created_at: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true,
      error: null,
    }));

    try {
      // Send to backend
      const response = await sendMessage({
        conversation_id: conversationId,
        user_message: userMessage,
      });

      // Add AI response to UI
      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: 'system',
        message_text: response.is_complete ? response.final_summary || '' : response.next_question || '',
        created_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMsg],
        isComplete: response.is_complete,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send message. Please try again.',
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="chat-container mx-auto w-full px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-center">
          AI Competency Assessment
        </h1>
        <p className="text-sm text-center mt-1" style={{ color: 'var(--font-color-secondary)' }}>
          Business Owner Assessment
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="chat-container mx-auto h-full flex flex-col">
          <MessageList 
            messages={state.messages}
            isLoading={state.isLoading}
          />
        </div>
      </div>

      {/* Input */}
      <div className="chat-container mx-auto w-full px-4 py-3">
        <InputField
          onSendMessage={handleSendMessage}
          disabled={state.isLoading || state.isComplete}
          placeholder={
            state.isComplete 
              ? 'Assessment completed' 
              : state.isLoading 
              ? 'AI is typing...' 
              : 'Type your message...'
          }
        />
        
        {/* Error Message */}
        {state.error && (
          <div className="mt-2 text-sm text-red-600 text-center">
            {state.error}
          </div>
        )}

        {/* Completion Message */}
        {state.isComplete && (
          <div className="mt-2 text-sm text-green-600 text-center">
            Assessment completed! Your personalized report has been generated.
          </div>
        )}
      </div>
    </div>
  );
}