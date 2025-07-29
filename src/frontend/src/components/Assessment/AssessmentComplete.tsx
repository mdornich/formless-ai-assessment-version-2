import React from 'react'
import { CheckCircle, Download, Share } from 'lucide-react'

interface AssessmentCompleteProps {
  reportId?: string
  onDownloadReport?: () => void
  onShareResults?: () => void
}

export const AssessmentComplete: React.FC<AssessmentCompleteProps> = ({
  reportId,
  onDownloadReport,
  onShareResults
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Assessment Complete!
          </h1>
          <p className="text-gray-600">
            Thank you for completing the AI Competency Assessment. Your personalized report is being generated.
          </p>
        </div>

        {reportId && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Your report is ready! You can download it or share the results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {onDownloadReport && (
                <button
                  onClick={onDownloadReport}
                  className="flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
              )}
              
              {onShareResults && (
                <button
                  onClick={onShareResults}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Results
                </button>
              )}
            </div>
          </div>
        )}

        {!reportId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Your report is being generated and will be available shortly. You will receive a notification when it&apos;s ready.
            </p>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500">
          <p>Report ID: {reportId || 'Generating...'}</p>
        </div>
      </div>
    </div>
  )
}

export default AssessmentComplete