'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DbCheckPage() {
  const [results, setResults] = useState<any[]>([])
  const [checking, setChecking] = useState(false)

  const checkDatabase = async () => {
    setChecking(true)
    const checks: any[] = []

    // List of tables to check
    const tables = [
      'tables',
      'table_sessions',
      'phone_verifications',
      'session_users',
      'menu_categories',
      'menu_items',
      'orders'
    ]

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          checks.push({
            table: tableName,
            status: 'error',
            message: error.message,
            code: error.code
          })
        } else {
          checks.push({
            table: tableName,
            status: 'success',
            message: `Table exists (${data?.length || 0} sample records found)`
          })
        }
      } catch (err: any) {
        checks.push({
          table: tableName,
          status: 'error',
          message: err.message || 'Unknown error'
        })
      }
    }

    setResults(checks)
    setChecking(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Setup Checker
          </h1>
          <p className="text-gray-600 mb-6">
            This tool checks if your Supabase database tables are properly set up.
          </p>

          <button
            onClick={checkDatabase}
            disabled={checking}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-3 rounded-xl shadow-sm transition-all duration-200 mb-8"
          >
            {checking ? 'Checking...' : 'Check Database Setup'}
          </button>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Results:
              </h2>

              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        result.status === 'success'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {result.status === 'success' ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        result.status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.table}
                      </h3>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.code && (
                        <p className="text-xs text-red-600 mt-1">
                          Error code: {result.code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {results.some(r => r.status === 'error') && (
                <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                    Database Setup Required
                  </h3>
                  <div className="text-yellow-800 space-y-2">
                    <p>Your database tables are not set up yet. Follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>
                        Go to your{' '}
                        <a
                          href="https://tgqnvjopsyqexgfftymk.supabase.co"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline font-medium"
                        >
                          Supabase Dashboard
                        </a>
                      </li>
                      <li>Click on "SQL Editor" in the left sidebar</li>
                      <li>Copy the contents of <code className="bg-yellow-100 px-2 py-1 rounded">cafe-ordering-pwa/database-setup.sql</code></li>
                      <li>Paste into the SQL Editor and click "Run"</li>
                      <li>Come back here and click "Check Database Setup" again</li>
                    </ol>
                  </div>
                </div>
              )}

              {results.every(r => r.status === 'success') && (
                <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    All Set! 🎉
                  </h3>
                  <p className="text-green-800">
                    Your database is properly configured. You can now use the app!
                  </p>
                  <a
                    href="/scan"
                    className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  >
                    Go to Scan Page
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
