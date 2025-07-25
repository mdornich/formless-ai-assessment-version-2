import React, { useState } from 'react'
import { Assessment, Message } from '@/types'
import MessageList from './MessageList'
import InputField from './InputField'
import { Wifi, WifiOff } from 'lucide-react'

interface ChatInterfaceProps {
  assessment: Assessment
  messages: Message[]
  isConnected: boolean
  isTyping: boolean
  onSendMessage: (message: string) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  assessment,
  messages,
  isConnected,
  isTyping,
  onSendMessage
}) => {
  const [showTimestamps, setShowTimestamps] = useState(false)

  const isDisabled = !isConnected || assessment.status !== 'active'

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              AI Competency Assessment
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Business Owner Assessment
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hidden sm:block"
            >
              {showTimestamps ? 'Hide' : 'Show'} times
            </button>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className={`text-xs hidden sm:inline ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages}
        isTyping={isTyping}
        showTimestamps={showTimestamps}
      />

      {/* Input */}
      <InputField
        onSendMessage={onSendMessage}
        disabled={isDisabled}
        placeholder={
          !isConnected 
            ? 'Connecting...' 
            : assessment.status !== 'active'
            ? 'Assessment completed'
            : 'Type your message...'
        }
      />

      {/* Status Messages */}
      {assessment.status === 'completed' && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-2">
          <p className="text-sm text-green-700 text-center">
            Assessment completed! Your report is being generated.
          </p>
        </div>
      )}
      
      {assessment.status === 'expired' && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2">
          <p className="text-sm text-red-700 text-center">
            This assessment session has expired.
          </p>
        </div>
      )}
    </div>
  )
}

export default ChatInterface