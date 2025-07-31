import { model } from '../config/gemini';
import { Message } from './database';

export interface AIResponse {
  next_question?: string;
  final_summary?: string;
  is_complete: boolean;
}

export class AIService {
  async generateResponse(
    systemPrompt: string,
    conversationHistory: Message[],
    questionBank: any,
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Build the full context for the AI
      const context = this.buildContext(systemPrompt, conversationHistory, questionBank, userMessage);
      
      // Call Gemini
      const result = await model.generateContent(context);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response from the AI
      const parsedResponse = this.parseAIResponse(text);
      return parsedResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Return a fallback response
      return {
        next_question: "I apologize, but I'm experiencing technical difficulties. Could you please repeat your last response?",
        is_complete: false
      };
    }
  }

  private buildContext(
    systemPrompt: string,
    conversationHistory: Message[],
    questionBank: any,
    userMessage: string
  ): string {
    // Start with the system prompt
    let context = systemPrompt;
    
    // Add the question bank
    if (questionBank) {
      context += `\n\nQuestion Bank:\n${JSON.stringify(questionBank, null, 2)}`;
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      context += '\n\nConversation History:';
      conversationHistory.forEach(msg => {
        const role = msg.sender === 'user' ? 'User' : 'Assistant';
        context += `\n${role}: ${msg.message_text}`;
      });
    }

    // Add the current user message
    context += `\n\nUser: ${userMessage}`;
    
    // Add the instruction to respond in JSON format
    context += '\n\nPlease respond with a single JSON object in the exact format specified in the system instructions.';

    return context;
  }

  private parseAIResponse(text: string): AIResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate the response format
        if (parsed.is_complete === true && parsed.final_summary) {
          return {
            final_summary: parsed.final_summary,
            is_complete: true
          };
        } else if (parsed.is_complete === false && parsed.next_question) {
          return {
            next_question: parsed.next_question,
            is_complete: false
          };
        }
      }
      
      // If parsing fails, treat as a next_question
      return {
        next_question: text.trim(),
        is_complete: false
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback response
      return {
        next_question: text.trim() || "Could you please tell me more about that?",
        is_complete: false
      };
    }
  }
}

export const aiService = new AIService();