import React, { useState, KeyboardEvent } from 'react';

interface InputFieldProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder: string;
}

export default function InputField({ onSendMessage, disabled, placeholder }: InputFieldProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex space-x-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="input-field flex-1 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          minHeight: '40px',
          maxHeight: '120px',
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="primary-button px-6 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        Send
      </button>
    </div>
  );
}