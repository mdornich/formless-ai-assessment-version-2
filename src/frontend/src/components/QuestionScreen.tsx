import React from 'react';

interface QuestionScreenProps {
  question: string;
}

export default function QuestionScreen({ question }: QuestionScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-8 py-8">
      <div className="max-w-4xl w-full text-center">
        <div className="question-container">
          <h2 className="text-4xl md:text-5xl font-semibold leading-relaxed" style={{ color: '#A3DDFB' }}>
            {question}
          </h2>
        </div>
      </div>
    </div>
  );
}