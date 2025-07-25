import React, { useEffect, useRef } from 'react'
import { Message } from '@/types'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
  showTimestamps?: boolean
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  showTimestamps = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          showTimestamp={showTimestamps}
        />
      ))}
      <TypingIndicator isVisible={isTyping} />
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList