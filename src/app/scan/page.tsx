'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import QRScanner from '@/components/QRScanner'
import useStore from '@/store'
import { supabaseApi } from '@/lib/supabase'

export default function ScanPage() {
  const router = useRouter()
  const { setTableNumber, setCurrentSession, setLoading, setError, isLoading, error } = useStore()
  const [scanResult, setScanResult] = useState<string | null>(null)

  const handleScanSuccess = async (decodedText: string) => {
    setLoading(true)
    setError(null)
    setScanResult(decodedText)

    try {
      // Get table info from QR code
      const table = await supabaseApi.getTableByQR(decodedText)
      
      if (!table) {
        setError('Invalid QR code. Please scan a valid table QR code.')
        return
      }

      // Check if table has active session or create new one
      let session = await supabaseApi.getActiveSession(table.id)
      
      if (!session) {
        session = await supabaseApi.createSession(table.id)
      }

      // Update store
      setTableNumber(table.table_number)
      setCurrentSession(session)

      // Redirect to phone verification
      router.push('/scan/phone-verify')
    } catch (error) {
      console.error('Error processing QR scan:', error)
      setError('Failed to process table information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleScanError = (error: string) => {
    console.error('QR scan error:', error)
  }

  const handleTestMode = async (tableNumber: string) => {
    setLoading(true)
    setError(null)

    try {
      // Create a mock QR code for testing
      const mockQRCode = `table_qr_${tableNumber.padStart(3, '0')}`
      
      // Try to get table, if not found create a mock one
      let table
      try {
        table = await supabaseApi.getTableByQR(mockQRCode)
      } catch {
        // For testing, create a mock table object
        table = {
          id: uuidv4(),
          table_number: tableNumber,
          qr_code: mockQRCode,
          capacity: 4,
          status: 'available' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      // Check if table has active session or create new one
      let session
      try {
        session = await supabaseApi.getActiveSession(table.id)
      } catch {
        // Create mock session for testing
        session = {
          id: uuidv4(),
          table_id: table.id,
          status: 'active' as const,
          sub_orders: [],
          total_amount: 0,
          created_at: new Date().toISOString()
        }
      }

      // Update store
      setTableNumber(table.table_number)
      setCurrentSession(session)

      // Redirect to phone verification
      router.push('/scan/phone-verify')
    } catch (error) {
      console.error('Error in test mode:', error)
      setError('Test mode failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full blur-xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Card */}
        <div className="card glass-effect animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              Welcome to CafeFlow
            </h1>
            <p className="text-gray-600 text-lg">
              Scan your table's QR code to begin your culinary journey
            </p>
          </div>

          {/* QR Scanner Section */}
          <div className="mb-8">
            <QRScanner 
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-800 font-medium">
                  Successfully scanned: {scanResult}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-blue-50 rounded-xl">
                <div className="loading-spinner text-blue-600"></div>
                <span className="text-blue-700 font-medium">Processing...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Test Mode Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
                <span className="text-amber-700 font-medium text-sm">Developer Mode</span>
              </div>
            </div>
            
            {/* Quick Table Selection */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['1', '2', '3', '4', '5', '6'].map((tableNum) => (
                <button
                  key={tableNum}
                  onClick={() => handleTestMode(tableNum)}
                  disabled={isLoading}
                  className="group relative bg-white hover:bg-gray-50 disabled:bg-gray-50 border border-gray-200 hover:border-blue-300 disabled:border-gray-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{tableNum}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                      Table {tableNum}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Random Table Button */}
            <button
              onClick={() => handleTestMode(Math.floor(Math.random() * 20 + 1).toString())}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🎲</span>
                <span>Random Table</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-white/80 text-sm backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 border border-white/20">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Camera access required for QR scanning
          </p>
        </div>
      </div>
    </div>
  )
}