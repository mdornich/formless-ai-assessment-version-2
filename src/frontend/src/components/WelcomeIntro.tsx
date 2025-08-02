import React, { useState, useEffect } from 'react';
import StarField from './StarField';

interface WelcomeIntroProps {
  onNext: () => void;
}

export default function WelcomeIntro({ onNext }: WelcomeIntroProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Start the cinematic sequence
    setShowAnimation(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--background-color)' }}>
      {/* Star Field Background */}
      <StarField />

      {/* Cinematic Content - Split into top and bottom sections */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Top Section - Move up by positioning closer to top */}
        <div className="flex-1 flex flex-col items-center justify-start pt-16 px-8">
          <div className="max-w-4xl w-full text-center">
            
            {/* "A long time ago..." opening */}
            <div className="cinematic-opening">
              <p className="text-lg md:text-xl text-blue-300 font-light animate-fade-in-from-space">
                In a digital universe far, far away...
              </p>
            </div>

            {/* Main Title - Zooming Effect */}
            <div className="cinematic-title">
              <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-cinematic-zoom">
                AI ASSESSMENT
              </h1>
            </div>

          </div>
        </div>


        {/* Middle Section - Opening Crawl Text - Now absolute positioned */}
        <div className="crawl-container">
          <div className="max-w-6xl w-full text-center mx-auto">
              <div className="crawl-text">
                <div className="crawl-content">
                  <p className="text-5xl md:text-6xl font-semibold mb-12">
                    🚀 Welcome to Your AI Assessment!
                  </p>
                  
                  <p className="text-4xl md:text-5xl leading-relaxed mb-12">
                    We're going to ask you 10 questions in order to better assess your current AI experience and expectations.
                  </p>
                  
                  <p className="text-4xl md:text-5xl leading-relaxed mb-12">
                    Once you complete it, we'll email you the report.
                  </p>
                  
                  <p className="text-4xl md:text-5xl font-semibold mb-12" style={{ color: '#FFA000' }}>
                    ✨ You might be surprised how much insight we can share back with just these questions! ✨
                  </p>


                  <p className="text-4xl md:text-5xl leading-relaxed">
                    Ready to discover your AI superpower? Let's dive in!
                  </p>
                </div>
              </div>
          </div>
        </div>

        {/* Bottom Section - Move down by positioning closer to bottom */}
        <div className="flex-1 flex flex-col items-center justify-end pb-16 px-8">
          <div className="max-w-4xl w-full text-center">
            
            {/* Epic Button - Appears after animation */}
            <div className="epic-button-container">
              <button
                onClick={onNext}
                className="epic-button px-12 py-4 text-xl font-bold rounded-xl transition-all transform hover:scale-105"
              >
                🚀 BEGIN YOUR JOURNEY 🚀
              </button>
              
              <p className="mt-6 text-lg font-light text-blue-200 animate-pulse">
                May the AI be with you...
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
