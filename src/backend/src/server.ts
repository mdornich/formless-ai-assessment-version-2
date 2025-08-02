import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { databaseService, Message } from './services/database';
import { aiService } from './services/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3005",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'formless-ai-backend-v2'
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const instructions = await databaseService.getInstructions('ai-readiness');
    res.json({
      status: 'ok',
      hasInstructions: !!instructions,
      instructions: instructions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Single chat endpoint - this is the core of the simplified architecture
app.post('/api/chat', async (req, res) => {
  try {
    const { conversation_id, user_message } = req.body;

    // Validate request
    if (!conversation_id || !user_message) {
      return res.status(400).json({
        error: 'conversation_id and user_message are required'
      });
    }

    // For demo purposes, bypass database if conversation ID starts with generated UUID pattern
    let conversation;
    if (conversation_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log(`Using demo mode for conversation: ${conversation_id}`);
      // Create a mock conversation object for demo
      conversation = {
        id: conversation_id,
        assessment_type: 'ai-readiness',
        status: 'in_progress'
      };
    } else {
      // Try to get conversation from database, create if it doesn't exist
      conversation = await databaseService.getConversation(conversation_id);
      if (!conversation) {
        console.log(`Creating new conversation: ${conversation_id}`);
        conversation = await databaseService.createConversation(conversation_id, 'ai-readiness');
        if (!conversation) {
          return res.status(500).json({
            error: 'Failed to create conversation'
          });
        }
      }
    }

    // Check if conversation is still in progress
    if (conversation.status !== 'in_progress') {
      return res.status(400).json({
        error: 'Conversation is not in progress'
      });
    }

    // Add user message to database (skip for demo mode)
    let messages: Message[] = [];
    if (!conversation_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      await databaseService.addMessage(conversation_id, 'user', user_message);
      messages = await databaseService.getMessages(conversation_id);
    } else {
      console.log('Demo mode: skipping database message operations');
      // Use empty message history for demo
      messages = [];
    }

    // Get AI instructions and question bank, use default if not found
    let instructions = await databaseService.getInstructions('BUSINESS_OWNER_COMPETENCY');
    if (!instructions) {
      console.log('No instructions found in database, using default instructions');
      // Use default instructions for demo purposes
      instructions = {
        id: 'default',
        name: 'AI Readiness Assessment',
        use_case: 'BUSINESS_OWNER_COMPETENCY',
        prompt_text: 'You are an AI assessment assistant. Ask questions to evaluate the user\'s AI readiness and competency. Start with basic questions about their current AI experience.',
        tone: 'professional',
        question_bank: {
          questions: [
            "What is your current experience with AI technologies?",
            "How do you envision AI impacting your business?",
            "What challenges do you face in implementing AI solutions?"
          ]
        }
      };
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      instructions.prompt_text,
      messages,
      instructions.question_bank,
      user_message
    );

    // Add AI response to database (skip for demo mode)
    if (!conversation_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      if (aiResponse.next_question) {
        await databaseService.addMessage(conversation_id, 'system', aiResponse.next_question);
      } else if (aiResponse.final_summary) {
        await databaseService.addMessage(conversation_id, 'system', aiResponse.final_summary);
        // Update conversation status and create assessment
        await databaseService.updateConversationStatus(conversation_id, 'completed');
        await databaseService.createAssessment(conversation_id, aiResponse.final_summary);
      }
    } else {
      console.log('Demo mode: skipping database AI response operations');
    }

    // Return response in exact format specified
    if (aiResponse.is_complete) {
      res.json({
        final_summary: aiResponse.final_summary,
        is_complete: true
      });
    } else {
      res.json({
        next_question: aiResponse.next_question,
        is_complete: false
      });
    }

  } catch (error) {
    console.error('Error in /api/chat:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Formless AI Backend v2.0 running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint available at http://localhost:${PORT}/api/chat`);
});

export default app;