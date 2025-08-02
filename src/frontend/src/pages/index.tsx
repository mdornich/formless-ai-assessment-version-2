import React, { useState } from 'react';
import Head from 'next/head';
import WelcomePage from '../components/WelcomePage';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleStart = (name: string, company: string, email: string) => {
    // Log the user data
    console.log('Starting assessment for:', { name, company, email });
    
    // Generate a demo conversation ID (UUID format)
    const demoConversationId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    console.log('Generated conversation ID:', demoConversationId);
    console.log('Redirecting to:', `/assessment/${demoConversationId}`);
    
    // Redirect to the assessment page
    router.push(`/assessment/${demoConversationId}`);
  };

  return (
    <>
      <Head>
        <title>Formless AI Assessment Platform v2.0</title>
        <meta name="description" content="AI-powered conversational assessment platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <WelcomePage onStart={handleStart} />
    </>
  );
}