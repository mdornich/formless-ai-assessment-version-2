import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Formless AI Assessment Platform v2.0</title>
        <meta name="description" content="AI-powered conversational assessment platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="chat-container w-full p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">
            Formless AI Assessment Platform
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--font-color-secondary)' }}>
            AI-powered conversational assessment platform
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--font-color-secondary)' }}>
            Version 2.0 - Simplified Architecture
          </p>
          
          <div className="space-y-4">
            <p>
              To start an assessment, you need a conversation link provided by the system administrator.
            </p>
            <p className="text-sm" style={{ color: 'var(--font-color-secondary)' }}>
              Assessment links follow the format: <code>/assessment/[conversation-id]</code>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}