// Types for the full-screen survey experience

export interface SurveyState {
  currentQuestion: string;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  questionNumber: number;
  totalQuestions: number;
  finalSummary?: string;
}

export interface QuestionResponse {
  next_question?: string;
  final_summary?: string;
  is_complete: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}