import React from 'react';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const timestamp = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-md space-y-1">
        <div
          className={`px-4 py-2 ${
            isUser ? 'chat-bubble-user' : 'chat-bubble-agent'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.message_text}
          </p>
        </div>
        <div 
          className={`text-xs px-2 ${isUser ? 'text-right' : 'text-left'}`}
          style={{ color: 'var(--font-color-secondary)' }}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
}