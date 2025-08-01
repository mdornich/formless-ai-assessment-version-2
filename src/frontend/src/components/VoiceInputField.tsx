import React, { useState, useRef, useEffect } from 'react';

interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder: string;
}

// Extend Window interface to include webkit speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceInputField({ 
  value, 
  onChange, 
  onSubmit, 
  disabled, 
  placeholder 
}: VoiceInputFieldProps) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(value + (value ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Focus the textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Re-focus when value is cleared (new question appears)
  useEffect(() => {
    if (!value && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value]);

  const handleVoiceInput = () => {
    if (recognitionRef.current && speechSupported && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-8 pb-8">
      <div className="glass depth-medium rounded-2xl p-6">
        <div className="flex items-end space-x-4">
          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={3}
              className="input-field w-full px-4 py-3 text-lg resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: 'var(--font-color-primary)',
                minHeight: '80px',
                maxHeight: '200px',
              }}
            />
          </div>

          {/* Voice Input Button */}
          {speechSupported && (
            <button
              onClick={handleVoiceInput}
              disabled={disabled || isListening}
              className={`p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'hover:bg-gray-100 text-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Listening...' : 'Click to speak'}
            >
              {isListening ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a2 2 0 114 0v4a2 2 0 11-4 0V7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="primary-button px-8 py-3 text-lg font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {disabled ? 'Processing...' : 'Continue'}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: 'var(--font-color-secondary)' }}>
            Press Enter to continue or {speechSupported ? 'use the microphone to speak your answer' : 'speech recognition not available'}
          </p>
        </div>
      </div>
    </div>
  );
}