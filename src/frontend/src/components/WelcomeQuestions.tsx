import React, { useState } from 'react';
import QuestionScreen from './QuestionScreen';
import VoiceInputField from './VoiceInputField';

interface WelcomeQuestionsProps {
  onComplete: (name: string, company: string, email: string) => void;
}

type QuestionStep = 'name' | 'company' | 'email';

export default function WelcomeQuestions({ onComplete }: WelcomeQuestionsProps) {
  const [currentStep, setCurrentStep] = useState<QuestionStep>('name');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = {
    name: "What's your name? 👋",
    company: "What's your company name? 🏢", 
    email: "What's your email address? 📧"
  };

  const placeholders = {
    name: "Type your name here...",
    company: "Type your company name here...",
    email: "Type your email address here..."
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      if (currentStep === 'name') {
        setName(inputValue.trim());
        setInputValue('');
        setCurrentStep('company');
      } else if (currentStep === 'company') {
        setCompany(inputValue.trim());
        setInputValue('');
        setCurrentStep('email');
      } else if (currentStep === 'email') {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputValue.trim())) {
          setIsSubmitting(false);
          // Could add error handling here
          return;
        }
        
        setEmail(inputValue.trim());
        onComplete(name, company, inputValue.trim());
      }
      
      setIsSubmitting(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isSubmitting) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background-color)' }}>
      
      {/* Question Display */}
      <QuestionScreen question={questions[currentStep]} />
      
      {/* Input Field */}
      <VoiceInputField
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={isSubmitting}
        placeholder={placeholders[currentStep]}
        onKeyPress={handleKeyPress}
      />

      {/* Progress indicator */}
      <div className="px-8 pb-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm" style={{ color: 'var(--font-color-secondary)' }}>
            {currentStep === 'name' && "Step 1 of 3"}
            {currentStep === 'company' && "Step 2 of 3"}
            {currentStep === 'email' && "Step 3 of 3 • We'll send your report here! 📊"}
          </p>
        </div>
      </div>
    </div>
  );
}