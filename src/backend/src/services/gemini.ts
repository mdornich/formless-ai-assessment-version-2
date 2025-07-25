import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

export interface ConversationMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface AssessmentResponse {
  next_question?: string;
  final_summary?: string;
  is_complete: boolean;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  async generateAssessmentResponse(
    systemPrompt: string,
    conversationHistory: ConversationMessage[],
    currentUserInput: string
  ): Promise<AssessmentResponse> {
    try {
      // Build the conversation context
      const context = this.buildConversationContext(systemPrompt, conversationHistory, currentUserInput);
      
      logger.info('Sending request to Gemini API', { 
        conversationLength: conversationHistory.length,
        userInputLength: currentUserInput.length 
      });

      const result = await this.model.generateContent(context);
      const response = await result.response;
      const text = response.text();

      logger.info('Received response from Gemini API', { responseLength: text.length });

      // Parse the JSON response
      const parsedResponse = this.parseAssessmentResponse(text);
      
      return parsedResponse;
    } catch (error) {
      logger.error('Error generating assessment response:', error);
      throw new Error('Failed to generate assessment response');
    }
  }

  private buildConversationContext(
    systemPrompt: string,
    conversationHistory: ConversationMessage[],
    currentUserInput: string
  ): string {
    let context = systemPrompt + '\n\n';
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      context += 'CONVERSATION HISTORY:\n';
      conversationHistory.forEach((message, index) => {
        context += `${message.role.toUpperCase()}: ${message.content}\n`;
      });
      context += '\n';
    }

    // Add current user input
    context += `CURRENT USER INPUT: ${currentUserInput}\n\n`;
    context += 'Provide your response as a single, minified JSON object following the format specified in the system instructions.';

    return context;
  }

  private parseAssessmentResponse(responseText: string): AssessmentResponse {
    try {
      // Clean the response text to extract JSON
      let cleanedText = responseText.trim();
      
      // Remove any markdown code block formatting
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON object in the response
      const jsonMatch = cleanedText.match(/\{.*\}/s);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedText);

      // Validate response structure
      if (typeof parsed.is_complete !== 'boolean') {
        throw new Error('Invalid response: is_complete must be boolean');
      }

      if (parsed.is_complete) {
        if (!parsed.final_summary || typeof parsed.final_summary !== 'string') {
          throw new Error('Invalid response: final_summary required when is_complete is true');
        }
        return {
          final_summary: parsed.final_summary,
          is_complete: true
        };
      } else {
        if (!parsed.next_question || typeof parsed.next_question !== 'string') {
          throw new Error('Invalid response: next_question required when is_complete is false');
        }
        return {
          next_question: parsed.next_question,
          is_complete: false
        };
      }
    } catch (error) {
      logger.error('Error parsing assessment response:', { error, responseText });
      
      // Fallback response if parsing fails
      return {
        next_question: "I'd like to understand more about your experience with AI. Can you tell me about any AI tools you've used in your work or personal life?",
        is_complete: false
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Test connection. Respond with 'Connected' only.");
      await result.response;
      return true;
    } catch (error) {
      logger.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();