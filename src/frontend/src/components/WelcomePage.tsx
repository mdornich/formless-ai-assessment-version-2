import React, { useState } from 'react';
import WelcomeIntro from './WelcomeIntro';
import WelcomeQuestions from './WelcomeQuestions';

interface WelcomePageProps {
  onStart: (name: string, company: string, email: string) => void;
}

type WelcomeStep = 'intro' | 'questions';

export default function WelcomePage({ onStart }: WelcomePageProps) {
  const [currentStep, setCurrentStep] = useState<WelcomeStep>('intro');

  const handleIntroNext = () => {
    setCurrentStep('questions');
  };

  const handleQuestionsComplete = (name: string, company: string, email: string) => {
    onStart(name, company, email);
  };

  if (currentStep === 'intro') {
    return <WelcomeIntro onNext={handleIntroNext} />;
  }

  return <WelcomeQuestions onComplete={handleQuestionsComplete} />;
}