import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Assessment, Message, ApiError } from '@/types'
import { assessmentApi } from '@/utils/api'
import { ERROR_MESSAGES } from '@/utils/constants'
import toast from 'react-hot-toast'

interface UseAssessmentProps {
  token: string
}

interface UseAssessmentReturn {
  assessment: Assessment | undefined
  messages: Message[]
  isLoading: boolean
  isError: boolean
  error: ApiError | null
  sendMessage: (content: string) => Promise<void>
  isMessageSending: boolean
  refetchMessages: () => void
}

export const useAssessment = ({ token }: UseAssessmentProps): UseAssessmentReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const queryClient = useQueryClient()

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
    error: assessmentError,
  } = useQuery({
    queryKey: ['assessment', token],
    queryFn: () => assessmentApi.getAssessment(token),
    enabled: !!token,
    retry: 1,
    staleTime: 30000,
  })

  const {
    data: fetchedMessages,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', token],
    queryFn: () => assessmentApi.getMessages(token),
    enabled: !!token && !!assessment,
    retry: 1,
    staleTime: 0,
  })

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      assessmentApi.sendMessage({ content, token }),
    onSuccess: (response) => {
      const newMessage = response.message
      setMessages(prev => [...prev, newMessage])
      
      if (response.isComplete) {
        queryClient.invalidateQueries({ queryKey: ['assessment', token] })
        toast.success('Assessment completed!')
      }
    },
    onError: (error: ApiError) => {
      console.error('Failed to send message:', error)
      toast.error(error.message || ERROR_MESSAGES.MESSAGE_SEND_FAILED)
    },
  })

  // Update local messages when fetched messages change
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages)
    }
  }, [fetchedMessages])

  // Add new message to local state
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const exists = prev.some(m => m.id === message.id)
      if (exists) return prev
      return [...prev, message]
    })
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!assessment || assessment.status !== 'active') {
      toast.error(ERROR_MESSAGES.ASSESSMENT_EXPIRED)
      return
    }

    // Add user message immediately for optimistic UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      assessmentId: assessment.id,
    }
    
    setMessages(prev => [...prev, tempMessage])

    try {
      await sendMessageMutation.mutateAsync(content)
      // Remove temp message after successful send
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      throw error
    }
  }, [assessment, sendMessageMutation])

  const isLoading = isAssessmentLoading || isMessagesLoading
  const isError = isAssessmentError || isMessagesError
  const error = (assessmentError || messagesError) as ApiError | null

  return {
    assessment,
    messages,
    isLoading,
    isError,
    error,
    sendMessage,
    isMessageSending: sendMessageMutation.isPending,
    refetchMessages,
  }
}