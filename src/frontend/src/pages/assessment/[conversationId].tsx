import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SurveyInterface from '@/components/SurveyInterface';

export default function Assessment() {
  const router = useRouter();
  const { conversationId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      if (conversationId && typeof conversationId === 'string') {
        // Validate conversation ID format (should be a UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(conversationId)) {
          setLoading(false);
        } else {
          setError('Invalid assessment link format.');
          setLoading(false);
        }
      } else {
        setError('Assessment ID is missing or invalid.');
        setLoading(false);
      }
    }
  }, [router.isReady, conversationId]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Assessment - Formless AI</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-color)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Preparing your assessment...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Formless AI Assessment</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background-color)' }}>
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-red-600">Invalid Assessment Link</h1>
            <p className="mb-6 text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="primary-button px-6 py-3 rounded-xl font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>AI Competency Assessment - Formless AI</title>
        <meta name="description" content="AI-powered business competency assessment - Full screen survey experience" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SurveyInterface conversationId={conversationId as string} />
    </>
  );
}