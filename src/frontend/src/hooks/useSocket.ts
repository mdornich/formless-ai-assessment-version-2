import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Message, Assessment, SocketEvents, ApiError } from '@/types'
import { API_CONFIG, SOCKET_EVENTS, UI_CONFIG } from '@/utils/constants'
import toast from 'react-hot-toast'

interface UseSocketProps {
  token: string
  onNewMessage?: (message: Message) => void
  onAssessmentComplete?: (reportId: string) => void
  onAssessmentJoined?: (data: { assessment: Assessment; messages: Message[] }) => void
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  isTyping: boolean
  sendMessage: (message: string) => void
  joinAssessment: (token: string) => void
  emitTyping: () => void
}

export const useSocket = ({
  token,
  onNewMessage,
  onAssessmentComplete,
  onAssessmentJoined,
}: UseSocketProps): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current
    }

    const socket = io(API_CONFIG.SOCKET_URL, {
      timeout: API_CONFIG.TIMEOUT,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true,
    })

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)
      toast.success('Connected to server')
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
      setIsTyping(false)
      toast.error('Disconnected from server')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      toast.error('Failed to connect to server')
    })

    // Assessment events
    socket.on(SOCKET_EVENTS.ASSESSMENT_STARTED, (data: { assessmentId: string; firstQuestion: string }) => {
      console.log('Assessment started:', data)
      // Handle assessment start if needed
    })

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, (data: { assessmentId: string; userMessage: string; aiResponse: any; timestamp: string }) => {
      console.log('Message received:', data)
      const message: Message = {
        id: Date.now().toString(),
        content: data.aiResponse.next_question || '',
        role: 'agent',
        timestamp: data.timestamp,
      }
      onNewMessage?.(message)
      setIsTyping(false)
    })

    socket.on(SOCKET_EVENTS.ASSESSMENT_COMPLETED, (data: { assessmentId: string; finalSummary?: any }) => {
      console.log('Assessment completed:', data)
      setIsTyping(false)
      onAssessmentComplete?.(data.assessmentId)
      toast.success('Assessment completed!')
    })

    socket.on(SOCKET_EVENTS.ASSESSMENT_ABANDONED, (data: { assessmentId: string }) => {
      console.log('Assessment abandoned:', data)
      toast('Assessment has been abandoned')
    })

    socket.on(SOCKET_EVENTS.CONVERSATION_RESTARTED, (data: { assessmentId: string; firstQuestion: string }) => {
      console.log('Conversation restarted:', data)
      toast('Conversation has been restarted')
    })

    socket.on(SOCKET_EVENTS.ERROR, (error: ApiError) => {
      console.error('Socket error:', error)
      toast.error(error.message || 'An error occurred')
    })

    socketRef.current = socket
    return socket
  }, [onNewMessage, onAssessmentComplete, onAssessmentJoined])

  const joinAssessment = useCallback((assessmentToken: string) => {
    const socket = socketRef.current
    if (socket?.connected) {
      console.log('Joining assessment:', assessmentToken)
      socket.emit(SOCKET_EVENTS.JOIN_ASSESSMENT, assessmentToken)
    }
  }, [])

  const sendMessage = useCallback((message: string) => {
    const socket = socketRef.current
    if (socket?.connected) {
      console.log('Sending message via socket:', message)
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, message)
    }
  }, [])

  const emitTyping = useCallback(() => {
    const socket = socketRef.current
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.TYPING)
    }
  }, [])

  // Initialize socket when token changes
  useEffect(() => {
    if (token) {
      const socket = initializeSocket()
      
      // Join assessment once connected
      if (socket.connected) {
        joinAssessment(token)
      } else {
        socket.on('connect', () => {
          joinAssessment(token)
        })
      }
    }

    return () => {
      // Cleanup on unmount or token change
      if (socketRef.current) {
        socketRef.current.off('connect')
        socketRef.current.off('disconnect')
        socketRef.current.off('connect_error')
        socketRef.current.off(SOCKET_EVENTS.ASSESSMENT_STARTED)
        socketRef.current.off(SOCKET_EVENTS.MESSAGE_RECEIVED)
        socketRef.current.off(SOCKET_EVENTS.ASSESSMENT_COMPLETED)
        socketRef.current.off(SOCKET_EVENTS.ASSESSMENT_ABANDONED)
        socketRef.current.off(SOCKET_EVENTS.CONVERSATION_RESTARTED)
        socketRef.current.off(SOCKET_EVENTS.ERROR)
        socketRef.current.disconnect()
        socketRef.current = null
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [token, initializeSocket, joinAssessment])

  return {
    socket: socketRef.current,
    isConnected,
    isTyping,
    sendMessage,
    joinAssessment,
    emitTyping,
  }
}