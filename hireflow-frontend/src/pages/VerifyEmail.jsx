import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const data = await api.verifyEmail(token)
      setStatus('success')
      setMessage('Email verified successfully! Redirecting to dashboard...')
      
      // Wait 2 seconds then redirect
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Verification failed. The link may have expired.')
    }
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[50%] rounded-full bg-tertiary/10 blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-[480px] px-4">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[32px] text-primary">rocket_launch</span>
            <span className="text-2xl font-bold text-primary">HireFlow</span>
          </div>
          <p className="text-sm text-on-surface-variant">Email Verification</p>
        </div>

        <div className="glass-card shadow-xl rounded-2xl p-8 md:p-10 border border-white/40">
          <div className="flex flex-col items-center text-center">
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[40px] text-primary animate-spin">
                    progress_activity
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-on-surface mb-2">
                  Verifying Email
                </h1>
                <p className="text-sm text-secondary">
                  {message}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[40px] text-green-600">
                    check_circle
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-on-surface mb-2">
                  Email Verified!
                </h1>
                <p className="text-sm text-secondary mb-6">
                  {message}
                </p>
                <div className="w-full bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      progress_activity
                    </span>
                    <span className="text-sm font-semibold">Redirecting...</span>
                  </div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mb-6 rounded-full bg-error-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[40px] text-error">
                    error
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-on-surface mb-2">
                  Verification Failed
                </h1>
                <p className="text-sm text-secondary mb-6">
                  {message}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Need help?{' '}
            <a href="mailto:support@hireflow.com" className="text-primary font-bold hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
