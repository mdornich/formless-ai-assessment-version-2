import React, { useState } from 'react';
import QuestionScreen from './QuestionScreen';
import VoiceInputField from './VoiceInputField';
import StarField from './StarField';

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
        const newName = inputValue.trim();
        setName(newName);
        setInputValue('');
        setCurrentStep('company');
      } else if (currentStep === 'company') {
        const newCompany = inputValue.trim();
        setCompany(newCompany);
        setInputValue('');
        setCurrentStep('email');
      } else if (currentStep === 'email') {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const newEmail = inputValue.trim();
        if (!emailRegex.test(newEmail)) {
          setIsSubmitting(false);
          // Could add error handling here
          return;
        }
        
        setEmail(newEmail);
        console.log('Completing assessment with:', { name, company, email: newEmail });
        onComplete(name, company, newEmail);
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
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--background-color)' }}>
      {/* Star Field Background */}
      <StarField />
      
      {/* Content with z-index to appear above stars */}
      <div className="relative z-10 flex flex-col flex-1">
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

      </div>
    </div>
  );
}