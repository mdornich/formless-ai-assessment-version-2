import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface InputFieldProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-3 sm:p-4 bg-white border-t flex-shrink-0">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="chat-input flex-1 max-h-32 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-2.5 sm:p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        <Send size={18} className="sm:w-5 sm:h-5" />
      </button>
    </form>
  )
}

export default InputField