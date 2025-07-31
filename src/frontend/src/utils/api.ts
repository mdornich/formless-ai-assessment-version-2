import axios from 'axios';
import { ChatRequest, ChatResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await api.post('/api/chat', request);
  return response.data;
};

export default api;