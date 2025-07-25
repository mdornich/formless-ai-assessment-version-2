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
  // Get assessment by token
  getAssessment: async (token: string): Promise<Assessment> => {
    const response = await api.get<Assessment>(`/assessments/${token}`)
    return response.data
  },

  // Get messages for an assessment
  getMessages: async (token: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/assessments/${token}/messages`)
    return response.data
  },

  // Send a message
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post<SendMessageResponse>(
      `/assessments/${request.token}/messages`,
      { content: request.content }
    )
    return response.data
  },

  // Complete assessment
  completeAssessment: async (token: string): Promise<void> => {
    await api.post(`/assessments/${token}/complete`)
  },

  // Get report (if available)
  getReport: async (token: string): Promise<any> => {
    const response = await api.get(`/assessments/${token}/report`)
    return response.data
  },
}

export default api