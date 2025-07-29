import React from 'react'

interface TypingIndicatorProps {
  isVisible: boolean
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="flex justify-start mb-4">
      <div className="message-bubble message-agent">
        <div className="typing-indicator">
          <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
          <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator