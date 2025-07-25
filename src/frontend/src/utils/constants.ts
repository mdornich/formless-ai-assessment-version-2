export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
}

export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_ASSESSMENT: 'join-assessment',
  SEND_MESSAGE: 'send-message',
  TYPING: 'typing',

  // Server to Client
  ASSESSMENT_JOINED: 'assessment-joined',
  NEW_MESSAGE: 'new-message',
  AGENT_TYPING: 'agent-typing',
  ASSESSMENT_COMPLETE: 'assessment-complete',
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