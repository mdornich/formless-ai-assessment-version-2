export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001',
  TIMEOUT: 30000,
}

export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_ASSESSMENT: 'join_assessment',
  SEND_MESSAGE: 'send_message', 
  TYPING: 'typing',

  // Server to Client (based on backend routes)
  ASSESSMENT_STARTED: 'assessment_started',
  MESSAGE_RECEIVED: 'message_received',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  ASSESSMENT_ABANDONED: 'assessment_abandoned',
  CONVERSATION_RESTARTED: 'conversation_restarted',
  ERROR: 'error',
} as const

export const ASSESSMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const

export const MESSAGE_ROLES = {
  USER: 'user',
  AGENT: 'agent',
} as const

export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to the server',
  INVALID_TOKEN: 'Invalid or expired assessment token',
  MESSAGE_SEND_FAILED: 'Failed to send message',
  ASSESSMENT_EXPIRED: 'This assessment session has expired',
  NETWORK_ERROR: 'Network error - please check your connection',
} as const

export const UI_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_TIMEOUT: 3000,
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 2000,
} as const