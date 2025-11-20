'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isValidPhoneNumber } from 'react-phone-number-input'
import useStore from '@/store'
import { supabaseApi } from '@/lib/supabase'
import PhoneInput from '@/components/PhoneInput'

export default function PhoneVerifyPage() {
  const router = useRouter()
  const {
    currentSession,
    tableNumber,
    setCurrentUser,
    setLoading,
    setError,
    isLoading,
    error,
    _hasHydrated
  } = useStore()

  const [step, setStep] = useState<'phone' | 'verify' | 'name'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [userName, setUserName] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  // Wait for hydration before redirecting
  useEffect(() => {
    if (_hasHydrated && (!currentSession || !tableNumber)) {
      router.push('/scan')
    }
  }, [_hasHydrated, currentSession, tableNumber, router])

  // Don't render until hydrated
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner text-white text-4xl"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no session (after hydration)
  if (!currentSession || !tableNumber) {
    return null
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate phone number
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number.')
      setLoading(false)
      return
    }

    try {
      // Hardcoded verification code for testing
      const code = '123456'
      setGeneratedCode(code)

      // In a real app, send SMS here
      console.log(`SMS Code for ${phoneNumber}: ${code}`)

      setStep('verify')
    } catch (error) {
      console.error('Error sending verification code:', error)
      setError('Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Hardcoded verification - only accept 123456
      if (verificationCode !== '123456') {
        throw new Error('Invalid verification code. Please enter 123456.')
      }

      setStep('name')
    } catch (error) {
      console.error('Error verifying code:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : 'Invalid verification code. Please try again.'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create user in session
      const user = await supabaseApi.createSessionUser(
        currentSession.id,
        phoneNumber,
        userName
      )

      setCurrentUser(user)
      router.push('/menu')
    } catch (error) {
      console.error('Error creating user:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        raw: JSON.stringify(error, null, 2)
      })

      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to join table session. Please try again.'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-16 right-16 w-24 h-24 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-8 w-40 h-40 bg-white rounded-full blur-xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Progress Steps */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  stepNum <= (step === 'phone' ? 1 : step === 'verify' ? 2 : 3) 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'bg-white/30 text-white/70'
                }`}>
                  {stepNum <= (step === 'phone' ? 1 : step === 'verify' ? 2 : 3) ? (
                    stepNum < (step === 'phone' ? 1 : step === 'verify' ? 2 : 3) ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : stepNum
                  ) : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 ml-2 transition-all duration-300 ${
                    stepNum < (step === 'phone' ? 1 : step === 'verify' ? 2 : 3) 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-2">
            <span className="text-xs text-white font-medium">Phone</span>
            <span className="text-xs text-white font-medium">Verify</span>
            <span className="text-xs text-white font-medium">Name</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="card glass-effect animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Table {tableNumber}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {step === 'phone' && 'Let\'s verify your identity to join this table'}
              {step === 'verify' && 'Check your phone for the verification code'}
              {step === 'name' && 'Almost there! Tell us your name'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📱 Phone Number
                </label>
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  error={!!error}
                />
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    We'll send a verification code via SMS to confirm your number
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !phoneNumber || !isValidPhoneNumber(phoneNumber || '')}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner"></div>
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Verification Code</span>
                  </div>
                )}
              </button>
            </form>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <form onSubmit={handleCodeVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔐 Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`input-field text-center text-2xl font-mono tracking-widest ${error ? 'input-error' : ''}`}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 text-center flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Code sent to {phoneNumber}
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="btn-success w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Code</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="btn-secondary w-full"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Phone Number</span>
                </div>
              </button>
            </form>
          )}

          {/* Name Step */}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  👋 What's your name?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`input-field text-lg ${error ? 'input-error' : ''}`}
                  placeholder="Enter your name"
                  autoComplete="name"
                  autoFocus
                  required
                />
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    This name will be shown to others at your table
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !userName.trim()}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner"></div>
                    <span>Joining Table...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Join Table</span>
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}