export interface Message {
  id: string
  content: string
  role: 'user' | 'agent'
  timestamp: Date
  assessmentId: string
}

export interface Assessment {
  id: string
  token: string
  status: 'active' | 'completed' | 'expired'
  userId?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  reportId?: string
}

export interface AssessmentSession {
  assessment: Assessment
  messages: Message[]
  isTyping: boolean
  isConnected: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface SocketEvents {
  'join-assessment': (token: string) => void
  'send-message': (message: string) => void
  'typing': () => void
  'assessment-joined': (data: { assessment: Assessment; messages: Message[] }) => void
  'new-message': (message: Message) => void
  'agent-typing': () => void
  'assessment-complete': (reportId: string) => void
  'error': (error: ApiError) => void
}

export interface SendMessageRequest {
  content: string
  token: string
}

export interface SendMessageResponse {
  message: Message
  isComplete?: boolean
}