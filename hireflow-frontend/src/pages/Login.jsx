import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('CANDIDATE')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Password validation
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login(email, password)
      // Tokens are already stored by api.login()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }
    
    try {
      await api.register(email, password, fullName, role)
      setMessage('Registration successful! Please check your email to verify your account.')
      setEmail('')
      setPassword('')
      setFullName('')
      setIsSignUp(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
          <p className="text-sm text-on-surface-variant">Precision recruitment at scale.</p>
        </div>

        <div className="glass-card shadow-xl rounded-2xl p-8 md:p-10 border border-white/40">
          <h1 className="text-2xl font-bold text-on-surface mb-2 text-center">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-secondary text-center mb-8">
            {isSignUp ? 'Start your 14-day free trial' : 'Sign in to continue to HireFlow'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/20 text-error text-xs font-semibold rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {message}
            </div>
          )}

          {!isSignUp ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email Address</label>
                <input
                  className="w-full px-4 py-3 bg-white/50 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
                  <button type="button" className="text-xs text-primary font-semibold hover:underline">Forgot?</button>
                </div>
                <input
                  className="w-full px-4 py-3 bg-white/50 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-semibold mb-1">Demo Credentials:</p>
                <p className="text-xs text-blue-700">marcus@hireflow.com / Demo123!</p>
                <p className="text-xs text-blue-700">admin@hireflow.com / Admin123!</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSignUp}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Full Name</label>
                <input
                  className="w-full px-4 py-3 bg-white/50 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Work Email</label>
                <input
                  className="w-full px-4 py-3 bg-white/50 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role</label>
                <select
                  className="w-full px-4 py-3 bg-white/50 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                >
                  <option value="CANDIDATE">Candidate</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Set Password</label>
                <input
                  className="w-full px-4 py-3 bg-white/50 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 font-semibold mb-1">Password Requirements:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li className="flex items-center gap-1">
                      <span className={password.length >= 8 ? 'text-green-600' : ''}>
                        {password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                        {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                        {/[0-9]/.test(password) ? '✓' : '○'} One number
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
                className="text-primary font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center items-center gap-8 opacity-60">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            SOC2 Type II
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            256-bit AES
          </div>
        </div>
      </main>
    </div>
  )
}
