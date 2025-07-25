import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { MessageCircle, Brain, CheckCircle } from 'lucide-react'

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>AI Competency Assessment Platform</title>
        <meta name="description" content="Evaluate your business's AI readiness with our conversational assessment platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Brain className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                AI Competency Assessment
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover your business&apos;s AI readiness through our intelligent conversational assessment
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <MessageCircle className="w-8 h-8 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Conversational</h3>
                <p className="text-gray-600">
                  Natural conversation with AI-powered assessment agents
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Brain className="w-8 h-8 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Intelligent</h3>
                <p className="text-gray-600">
                  Adaptive questions based on your responses and business context
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <CheckCircle className="w-8 h-8 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Actionable</h3>
                <p className="text-gray-600">
                  Receive detailed reports with personalized recommendations
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">
                To begin your assessment, you&apos;ll need a personalized assessment link. 
                Contact your assessment administrator to receive your unique token.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/assessment/demo"
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Try Demo Assessment
                </Link>
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => {
                    const token = prompt('Enter your assessment token:')
                    if (token) {
                      window.location.href = `/assessment/${token}`
                    }
                  }}
                >
                  Enter Assessment Token
                </button>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Powered by advanced AI technology for comprehensive business assessment
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage