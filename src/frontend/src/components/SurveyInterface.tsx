import React, { useState, useEffect } from 'react';
import { SurveyState } from '@/types/survey';
import { sendMessage } from '@/utils/api';
import ProgressBar from './ProgressBar';
import QuestionScreen from './QuestionScreen';
import VoiceInputField from './VoiceInputField';
import CompletionScreen from './CompletionScreen';
import WelcomePage from './WelcomePage';

interface SurveyInterfaceProps {
  conversationId: string;
}

export default function SurveyInterface({ conversationId }: SurveyInterfaceProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userName, setUserName] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [surveyState, setSurveyState] = useState<SurveyState>({
    currentQuestion: '',
    isComplete: false,
    isLoading: false,
    error: null,
    questionNumber: 1,
    totalQuestions: 10, // Estimated based on question bank
    finalSummary: '',
  });

  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleWelcomeStart = (name: string, company: string, email: string) => {
    setUserName(name);
    setUserCompany(company);
    setUserEmail(email);
    setShowWelcome(false);
    // Load the first question after welcome is completed
    loadFirstQuestion();
  };

  const loadFirstQuestion = async () => {
    try {
      setSurveyState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Send a welcome message to get the first question
      const response = await sendMessage({
        conversation_id: conversationId,
        user_message: 'Hello, I am ready to begin the assessment.',
      });

      setSurveyState(prev => ({
        ...prev,
        currentQuestion: response.next_question || 'Welcome to your assessment!',
        isComplete: response.is_complete,
        isLoading: false,
        finalSummary: response.final_summary || '',
      }));

    } catch (error) {
      console.error('Error loading first question:', error);
      setSurveyState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load assessment. Please refresh the page and try again.',
      }));
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || surveyState.isLoading) return;

    try {
      setSurveyState(prev => ({ ...prev, isLoading: true, error: null }));

      // Send user's answer to get next question
      const response = await sendMessage({
        conversation_id: conversationId,
        user_message: currentAnswer.trim(),
      });

      // Update survey state
      setSurveyState(prev => ({
        ...prev,
        currentQuestion: response.next_question || '',
        isComplete: response.is_complete,
        isLoading: false,
        finalSummary: response.final_summary || '',
        questionNumber: response.is_complete ? prev.questionNumber : prev.questionNumber + 1,
      }));

      // Clear the answer field for next question
      setCurrentAnswer('');

    } catch (error) {
      console.error('Error submitting answer:', error);
      setSurveyState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to submit answer. Please try again.',
      }));
    }
  };

  // Loading state
  if (surveyState.isLoading && !surveyState.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading your assessment...</p>
          <p className="text-sm mt-2" style={{ color: 'var(--font-color-secondary)' }}>
            Preparing your personalized questions
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (surveyState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass depth-heavy max-w-md w-full text-center rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-red-600">Assessment Error</h2>
          <p className="mb-6">{surveyState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="primary-button px-6 py-2 rounded-lg"
          >
            Retry Assessment
          </button>
        </div>
      </div>
    );
  }

  // Show welcome page first
  if (showWelcome) {
    return <WelcomePage onStart={handleWelcomeStart} />;
  }

  // Completion state
  if (surveyState.isComplete && surveyState.finalSummary) {
    return <CompletionScreen summary={surveyState.finalSummary} />;
  }

  // Main survey interface
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background-color)' }}>
      {/* Progress Bar */}
      <ProgressBar 
        current={surveyState.questionNumber} 
        total={surveyState.totalQuestions} 
      />

      {/* Question Display */}
      <QuestionScreen 
        question={surveyState.currentQuestion}
      />

      {/* Input Field */}
      <div className="flex-shrink-0">
        <VoiceInputField
          value={currentAnswer}
          onChange={setCurrentAnswer}
          onSubmit={handleSubmitAnswer}
          disabled={surveyState.isLoading}
          placeholder={
            surveyState.isLoading 
              ? 'Processing your answer...' 
              : 'Type your answer here or click the microphone to speak'
          }
        />
      </div>

      {/* Loading Overlay */}
      {surveyState.isLoading && surveyState.currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="glass depth-medium rounded-2xl p-6 flex items-center space-x-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Processing your response...</span>
          </div>
        </div>
      )}
    </div>
  );
}