import { Routes, Route, Navigate } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

// Authentication Guard
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user')
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <SpeedInsights />
    </>
  )
}
