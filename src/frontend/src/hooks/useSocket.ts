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
    socket.on(SOCKET_EVENTS.ASSESSMENT_JOINED, (data: { assessment: Assessment; messages: Message[] }) => {
      console.log('Assessment joined:', data)
      onAssessmentJoined?.(data)
    })

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message: Message) => {
      console.log('New message received:', message)
      onNewMessage?.(message)
      setIsTyping(false)
    })

    socket.on(SOCKET_EVENTS.AGENT_TYPING, () => {
      console.log('Agent is typing')
      setIsTyping(true)
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, UI_CONFIG.TYPING_TIMEOUT)
    })

    socket.on(SOCKET_EVENTS.ASSESSMENT_COMPLETE, (reportId: string) => {
      console.log('Assessment completed:', reportId)
      setIsTyping(false)
      onAssessmentComplete?.(reportId)
      toast.success('Assessment completed!')
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
        socketRef.current.off(SOCKET_EVENTS.ASSESSMENT_JOINED)
        socketRef.current.off(SOCKET_EVENTS.NEW_MESSAGE)
        socketRef.current.off(SOCKET_EVENTS.AGENT_TYPING)
        socketRef.current.off(SOCKET_EVENTS.ASSESSMENT_COMPLETE)
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