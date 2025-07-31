import React from 'react';

interface QuestionScreenProps {
  question: string;
  isWelcome?: boolean;
}

export default function QuestionScreen({ question, isWelcome = false }: QuestionScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16">
      <div className="max-w-4xl w-full text-center">
        {isWelcome && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
              Welcome to Your AI Competency Assessment
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--font-color-secondary)' }}>
              We'll ask you a series of questions to understand your current level with AI tools and concepts.
            </p>
          </div>
        )}
        
        <div className="question-container">
          <h2 className="text-3xl md:text-4xl font-semibold leading-relaxed">
            {question}
          </h2>
        </div>
        
        <div className="mt-12 text-lg" style={{ color: 'var(--font-color-secondary)' }}>
          <p>Type your answer below or use the microphone to speak your response</p>
        </div>
      </div>
    </div>
  );
}