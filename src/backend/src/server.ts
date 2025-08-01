import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { databaseService } from './services/database';
import { aiService } from './services/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

    // Get conversation from database
    const conversation = await databaseService.getConversation(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    // Check if conversation is still in progress
    if (conversation.status !== 'in_progress') {
      return res.status(400).json({
        error: 'Conversation is not in progress'
      });
    }

    // Add user message to database
    await databaseService.addMessage(conversation_id, 'user', user_message);

    // Get conversation history
    const messages = await databaseService.getMessages(conversation_id);

    // Get AI instructions and question bank
    const instructions = await databaseService.getInstructions('BUSINESS_OWNER_COMPETENCY');
    if (!instructions) {
      return res.status(500).json({
        error: 'AI instructions not found'
      });
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      instructions.prompt_text,
      messages,
      instructions.question_bank,
      user_message
    );

    // Add AI response to database
    if (aiResponse.next_question) {
      await databaseService.addMessage(conversation_id, 'system', aiResponse.next_question);
    } else if (aiResponse.final_summary) {
      await databaseService.addMessage(conversation_id, 'system', aiResponse.final_summary);
      // Update conversation status and create assessment
      await databaseService.updateConversationStatus(conversation_id, 'completed');
      await databaseService.createAssessment(conversation_id, aiResponse.final_summary);
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
      message: error.message,
      stack: error.stack,
      name: error.name
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