import React, { useState, useRef, useEffect } from 'react';

interface WelcomePageProps {
  onStart: (name: string, company: string, email: string) => void;
}

export default function WelcomePage({ onStart }: WelcomePageProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{name?: string; company?: string; email?: string}>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the name input
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const validateForm = () => {
    const newErrors: {name?: string; company?: string; email?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }
    
    if (!company.trim()) {
      newErrors.company = 'Please enter your company name';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onStart(name.trim(), company.trim(), email.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && name.trim() && company.trim() && email.trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background-color)' }}>
      {/* Main Welcome Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        <div className="max-w-4xl w-full text-center">
          
          {/* Welcome Message - Same layout as question container */}
          <div className="mb-6 p-4 md:p-6">
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent leading-tight">
                🚀 Welcome to Your AI Assessment!
              </h1>
              <div className="text-lg md:text-xl leading-relaxed space-y-2" style={{ color: 'var(--font-color-secondary)' }}>
                <p>We're going to ask you 10 questions in order to better assess your current AI experience and expectations.</p>
                <p>Once you complete it, we'll email you the report.</p>
                <p className="text-lg md:text-xl font-semibold" style={{ color: '#7A0B16' }}>
                  ✨ You might be surprised how much insight we can share back with just these questions! ✨
                </p>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="p-4">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
              Let's get started! 🎯
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="text-left">
                <label htmlFor="name" className="block text-base font-medium mb-1" style={{ color: 'var(--font-color-primary)' }}>
                  What's your name? 👋
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-2 text-base border-2 rounded-xl focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--container-background)',
                    color: 'var(--font-color-primary)',
                    borderColor: errors.name ? '#ff6b6b' : 'var(--primary-color)',
                  }}
                />
                {errors.name && (
                  <p className="mt-2 text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Company Input */}
              <div className="text-left">
                <label htmlFor="company" className="block text-base font-medium mb-1" style={{ color: 'var(--font-color-primary)' }}>
                  What's your company name? 🏢
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-2 text-base border-2 rounded-xl focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--container-background)',
                    color: 'var(--font-color-primary)',
                    borderColor: errors.company ? '#ff6b6b' : 'var(--primary-color)',
                  }}
                />
                {errors.company && (
                  <p className="mt-2 text-red-400 text-sm">{errors.company}</p>
                )}
              </div>

              {/* Email Input */}
              <div className="text-left">
                <label htmlFor="email" className="block text-base font-medium mb-1" style={{ color: 'var(--font-color-primary)' }}>
                  What's your email? 📧
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 text-base border-2 rounded-xl focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--container-background)',
                    color: 'var(--font-color-primary)',
                    borderColor: errors.email ? '#ff6b6b' : 'var(--primary-color)',
                  }}
                />
                {errors.email && (
                  <p className="mt-2 text-red-400 text-sm">{errors.email}</p>
                )}
                <p className="mt-2 text-sm" style={{ color: 'var(--font-color-secondary)' }}>
                  We'll send your personalized AI assessment report here! 📊
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !company.trim() || !email.trim()}
                  className="primary-button px-8 py-3 text-lg font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  🎉 Start My Assessment! 🎉
                </button>
              </div>
            </form>

            {/* Fun encouragement */}
            <div className="mt-4 text-base" style={{ color: 'var(--font-color-secondary)' }}>
              <p>✨ Ready to discover your AI superpower? Let's dive in! ✨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}