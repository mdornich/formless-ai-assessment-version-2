import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAssessment } from '@/hooks/useAssessment'
import { useSocket } from '@/hooks/useSocket'
import ChatInterface from '@/components/Chat/ChatInterface'
import Loading from '@/components/Common/Loading'
import ErrorBoundary from '@/components/Common/ErrorBoundary'
import { Message, Assessment } from '@/types'
import toast from 'react-hot-toast'

const AssessmentPage: React.FC = () => {
  const router = useRouter()
  const { token } = router.query
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [socketAssessment, setSocketAssessment] = useState<Assessment | null>(null)

  const assessmentToken = typeof token === 'string' ? token : ''

  const {
    assessment,
    messages: apiMessages,
    isLoading,
    isError,
    error,
    sendMessage: sendApiMessage,
    isMessageSending,
  } = useAssessment({ 
    token: assessmentToken 
  })

  const handleNewMessage = useCallback((message: Message) => {
    setLocalMessages(prev => {
      const exists = prev.some(m => m.id === message.id)
      if (exists) return prev
      return [...prev, message]
    })
  }, [])

  const handleAssessmentJoined = useCallback((data: { assessment: Assessment; messages: Message[] }) => {
    setSocketAssessment(data.assessment)
    setLocalMessages(data.messages)
  }, [])

  const handleAssessmentComplete = useCallback((reportId: string) => {
    if (socketAssessment) {
      setSocketAssessment(prev => prev ? { ...prev, status: 'completed', reportId } : null)
    }
    toast.success('Assessment completed! Report generated.')
  }, [socketAssessment])

  const {
    isConnected,
    isTyping,
    sendMessage: sendSocketMessage,
  } = useSocket({
    token: assessmentToken,
    onNewMessage: handleNewMessage,
    onAssessmentJoined: handleAssessmentJoined,
    onAssessmentComplete: handleAssessmentComplete,
  })

  // Sync messages between API and Socket
  useEffect(() => {
    if (apiMessages.length > 0 && localMessages.length === 0) {
      setLocalMessages(apiMessages)
    }
  }, [apiMessages, localMessages.length])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!assessmentToken) return

    // Use Socket.io if connected, otherwise fall back to API
    if (isConnected) {
      sendSocketMessage(content)
    } else {
      try {
        await sendApiMessage(content)
      } catch (error) {
        console.error('Failed to send message via API:', error)
      }
    }
  }, [assessmentToken, isConnected, sendSocketMessage, sendApiMessage])

  // Show loading state
  if (!token || isLoading) {
    return (
      <>
        <Head>
          <title>Loading Assessment - AI Competency Assessment</title>
        </Head>
        <Loading message="Loading your assessment..." fullScreen />
      </>
    )
  }

  // Show error state
  if (isError || error) {
    return (
      <>
        <Head>
          <title>Error - AI Competency Assessment</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Assessment Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              {error?.message || 'The assessment link may be invalid or expired.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    )
  }

  const currentAssessment = socketAssessment || assessment
  const currentMessages = localMessages.length > 0 ? localMessages : apiMessages

  if (!currentAssessment) {
    return (
      <>
        <Head>
          <title>Assessment Not Found - AI Competency Assessment</title>
        </Head>
        <Loading message="Assessment not found..." fullScreen />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>AI Competency Assessment - Business Owner</title>
        <meta name="description" content="Take the AI Competency Assessment to evaluate your business's AI readiness" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <ErrorBoundary>
        <ChatInterface
          assessment={currentAssessment}
          messages={currentMessages}
          isConnected={isConnected}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
        />
      </ErrorBoundary>
    </>
  )
}

export default AssessmentPage