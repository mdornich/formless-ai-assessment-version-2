import axios, { AxiosResponse } from 'axios'
import { Assessment, Message, SendMessageRequest, SendMessageResponse, ApiError } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code || error.code,
      status: error.response?.status,
    }
    return Promise.reject(apiError)
  }
)

export const assessmentApi = {
  // Get assessment by ID
  getAssessment: async (assessmentId: string): Promise<Assessment> => {
    const response = await api.get(`/assessment/${assessmentId}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get assessment')
    }
    const backendAssessment = response.data.data
    
    // Transform backend assessment format to frontend Assessment format
    return {
      id: backendAssessment.id,
      status: backendAssessment.status === 'active' ? 'in_progress' : 
              backendAssessment.status === 'completed' ? 'completed' : 'abandoned',
      competency_level: backendAssessment.competency_level,
      competency_label: backendAssessment.competency_label,
      created_at: backendAssessment.created_at,
      completed_at: backendAssessment.completed_at,
      conversation_length: backendAssessment.conversation_length
    }
  },

  // Get conversation history for an assessment
  getMessages: async (assessmentId: string): Promise<Message[]> => {
    const response = await api.get(`/assessment/${assessmentId}/conversation`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get messages')
    }
    const backendMessages = response.data.data.conversationHistory || []
    
    // Transform backend message format to frontend Message format
    return backendMessages.map((msg: any) => ({
      id: msg.id,
      content: msg.message_text,
      role: msg.sender === 'assistant' ? 'agent' : 'user',
      timestamp: msg.created_at,
      assessmentId: msg.conversation_id
    }))
  },

  // Send a message
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post(
      `/conversation/${request.token}/message`,
      { message: request.content }
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send message')
    }
    return {
      message: response.data.data.response.next_question || '',
      isComplete: response.data.data.isComplete || false,
      timestamp: response.data.data.timestamp
    }
  },

  // Start a new assessment
  startAssessment: async (assessmentType: string = 'business_owner_competency'): Promise<{ assessmentId: string; firstQuestion: string }> => {
    const response = await api.post('/assessment/start', {
      assessment_type: assessmentType
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to start assessment')
    }
    return {
      assessmentId: response.data.data.assessmentId,
      firstQuestion: response.data.data.firstQuestion
    }
  },

  // Abandon assessment
  abandonAssessment: async (assessmentId: string): Promise<void> => {
    const response = await api.post(`/assessment/${assessmentId}/abandon`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to abandon assessment')
    }
  },

  // Get conversation context
  getConversationContext: async (assessmentId: string): Promise<any> => {
    const response = await api.get(`/conversation/${assessmentId}/context`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get conversation context')
    }
    return response.data.data
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await api.get('/assessment/health')
      return response.data.success
    } catch {
      return false
    }
  },
}

export default api