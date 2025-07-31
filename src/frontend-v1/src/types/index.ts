export interface Message {
  id: string
  content: string
  role: 'user' | 'agent'
  timestamp: string | Date
  assessmentId?: string
}

export interface Assessment {
  id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  competency_level?: string
  competency_label?: string
  created_at: string
  completed_at?: string
  conversation_length?: number
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
  'join_assessment': (assessmentId: string) => void
  'send_message': (message: string) => void
  'typing': () => void
  'assessment_started': (data: { assessmentId: string; firstQuestion: string }) => void
  'message_received': (data: { assessmentId: string; userMessage: string; aiResponse: any; timestamp: string }) => void
  'assessment_completed': (data: { assessmentId: string; finalSummary?: any }) => void
  'assessment_abandoned': (data: { assessmentId: string }) => void
  'conversation_restarted': (data: { assessmentId: string; firstQuestion: string }) => void
  'error': (error: ApiError) => void
}

export interface SendMessageRequest {
  content: string
  token: string
}

export interface SendMessageResponse {
  message: string
  isComplete?: boolean
  timestamp?: string
}