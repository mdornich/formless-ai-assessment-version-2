import React from 'react'
import { Message } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface MessageBubbleProps {
  message: Message
  showTimestamp?: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showTimestamp = false 
}) => {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-agent'}`}>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        {showTimestamp && (
          <div className={`text-xs mt-2 ${isUser ? 'text-primary-100' : 'text-gray-500'}`}>
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble