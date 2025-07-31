import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ChatInterface from '@/components/ChatInterface';
import { Message } from '@/types';
import api from '@/utils/api';

export default function Assessment() {
  const router = useRouter();
  const { conversationId } = router.query;
  
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId && typeof conversationId === 'string') {
      loadConversationHistory(conversationId);
    }
  }, [conversationId]);

  const loadConversationHistory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll start with empty history and let the backend handle the initial question
      // In a full implementation, you might want to fetch existing messages here
      // const response = await api.get(`/api/conversation/${id}/messages`);
      // setInitialMessages(response.data.messages || []);
      
      setInitialMessages([]);
      setLoading(false);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation. Please check your conversation link.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Assessment - Formless AI</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your assessment...</p>
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
        </Head>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="chat-container w-full p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="primary-button px-6 py-2 rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!conversationId || typeof conversationId !== 'string') {
    return (
      <>
        <Head>
          <title>Invalid Assessment - Formless AI</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="chat-container w-full p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Assessment Link</h1>
            <p className="mb-6">The assessment link appears to be invalid or malformed.</p>
            <button
              onClick={() => router.push('/')}
              className="primary-button px-6 py-2 rounded-lg"
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
        <meta name="description" content="AI-powered business competency assessment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ChatInterface 
        conversationId={conversationId}
        initialMessages={initialMessages}
      />
    </>
  );
}