import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../types/assessment';

export const createTestConversation = (): Conversation => ({
  id: uuidv4(),
  user_id: uuidv4(),
  assessment_type: 'business_owner_competency',
  status: 'completed',
  current_step: 5,
  instruction_id: uuidv4(),
  session_token: 'test-token-123',
  created_at: new Date(),
  updated_at: new Date()
});

export const createTestMessages = (conversationId: string): Message[] => [
  {
    id: uuidv4(),
    conversation_id: conversationId,
    sender: 'assistant',
    message_text: 'Hello! I\'m here to help assess your AI competency as a business owner. How would you describe your current understanding of artificial intelligence and its business applications?',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    conversation_id: conversationId,
    sender: 'user',
    message_text: 'I\'ve been using ChatGPT regularly for about 6 months now. I use it mainly for writing emails, creating marketing content, and brainstorming ideas for my small consulting business. I understand it\'s based on large language models, but I\'m not super technical about how it works internally.',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    conversation_id: conversationId,
    sender: 'assistant',
    message_text: 'That\'s great to hear you\'re already using AI tools regularly! Can you tell me more about your consulting business and how you\'ve integrated ChatGPT into your workflows? What specific tasks has it helped you with the most?',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    conversation_id: conversationId,
    sender: 'user',
    message_text: 'I run a marketing consulting firm with 8 employees. ChatGPT has been incredibly helpful for drafting client proposals, creating content calendars, and even helping me prepare for client presentations. I\'ve started training my team on prompt engineering, and we\'ve built some custom GPTs for specific client industries. It\'s probably saved us 10-15 hours per week.',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    conversation_id: conversationId,
    sender: 'assistant',
    message_text: 'Impressive! You\'re clearly seeing real business value. What are your biggest concerns or excitement points about AI\'s future impact on your business? Are you considering any other AI tools or applications?',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    conversation_id: conversationId,
    sender: 'user',
    message_text: 'I\'m excited about the productivity gains, but I\'m concerned about staying competitive as AI becomes more widespread. I\'m looking into AI-powered analytics tools for campaign performance and considering building some automation workflows. My biggest worry is that our human creativity and client relationships remain our differentiator as AI commoditizes basic marketing tasks.',
    created_at: new Date()
  }
];

export const testUserContext = {
  name: 'Sarah Johnson',
  industry: 'Marketing Consulting',
  company_size: '8 employees',
  role: 'Founder & CEO'
};