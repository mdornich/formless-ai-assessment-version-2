import React from 'react';

interface CompletionScreenProps {
  summary: string;
}

export default function CompletionScreen({ summary }: CompletionScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-16" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="max-w-4xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Completion Message */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>
            Assessment Complete!
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--font-color-secondary)' }}>
            Thank you for completing your AI Competency Assessment. Here's your personalized summary:
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 text-left">
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--primary-color)' }}>
            Your AI Competency Profile
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-center">
          <p className="text-lg mb-6" style={{ color: 'var(--font-color-secondary)' }}>
            Your assessment results have been saved and will be used to provide you with personalized AI recommendations.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.print()}
              className="primary-button px-8 py-3 text-lg font-medium rounded-xl mr-4"
            >
              Print Results
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 text-lg font-medium rounded-xl transition-colors"
            >
              Take Another Assessment
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm" style={{ color: 'var(--font-color-secondary)' }}>
            Powered by Formless AI Assessment Platform v2.0
          </p>
        </div>
      </div>
    </div>
  );
}