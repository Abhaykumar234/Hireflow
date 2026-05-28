import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Home' },
  { path: '/jobs', icon: 'work', label: 'Jobs' },
  { path: '/applications', icon: 'group', label: 'Applicants' },
  { path: '/analytics', icon: 'analytics', label: 'Reports' },
]

export default function TopBar({ title = 'HireFlow' }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [pathname])

  useEffect(() => {
    if (!user?.id) return
    const fetchNotifs = async () => {
      try { setNotifications(await api.getNotifications(user.id)) } catch (_) {}
    }
    fetchNotifs()
    const iv = setInterval(fetchNotifs, 15000)
    return () => clearInterval(iv)
  }, [user?.id])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const handleMarkAll = async () => {
    if (!user?.id) return
    try {
      await api.markAllNotificationsAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (_) {}
  }

  const handleMarkOne = async (id) => {
    try {
      await api.markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (_) {}
  }

  const timeAgo = (ts) => {
    if (!ts) return ''
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(ts).toLocaleDateString()
  }

  const notifIcon = (msg = '') => {
    if (msg.includes('job') || msg.includes('Job')) return 'work'
    if (msg.includes('appli') || msg.includes('Appli')) return 'person_add'
    if (msg.includes('Welcome') || msg.includes('welcome')) return 'celebration'
    if (msg.includes('moved') || msg.includes('stage')) return 'swap_horiz'
    return 'notifications'
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 lg:px-10 bg-white/80 backdrop-blur-xl h-16 border-b border-white/40 shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative w-full max-w-md hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              id="topbar-search"
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm outline-none"
              placeholder="Search candidates, jobs..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              id="topbar-notifications-btn"
              onClick={() => setShowNotifications(v => !v)}
              className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 w-[360px] bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">Notifications</span>
                    {unread > 0 && <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">{unread} new</span>}
                  </div>
                  {unread > 0 && (
                    <button id="topbar-mark-all-read" onClick={handleMarkAll} className="text-xs text-primary font-semibold hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-outline-variant/10">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-secondary">
                      <span className="material-symbols-outlined text-[44px] mb-3 opacity-20">notifications_off</span>
                      <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkOne(n.id)}
                      className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors ${n.read ? 'hover:bg-surface-container-low' : 'bg-primary/[0.03] hover:bg-primary/[0.07]'}`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.read ? 'bg-surface-container-high' : 'bg-primary/10'}`}>
                        <span className={`material-symbols-outlined text-[16px] ${n.read ? 'text-secondary' : 'text-primary'}`}>
                          {notifIcon(n.message)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-secondary' : 'text-on-surface font-medium'}`}>{n.message}</p>
                        <p className="text-[10px] text-secondary mt-1">{timeAgo(n.timestamp)}</p>
                      </div>
                      {!n.read && <div className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-outline-variant/20 bg-surface-container-lowest/60 flex justify-end">
                  <button onClick={() => setShowNotifications(false)} className="text-xs text-secondary hover:text-primary font-medium transition-colors">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            id="topbar-settings-btn"
            onClick={() => navigate('/settings')}
            className={`p-2 rounded-xl transition-all ${pathname === '/settings' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className="h-7 w-px bg-outline-variant/30 mx-1 hidden md:block" />

          {/* User */}
          <button
            id="topbar-user-btn"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2.5 hover:bg-surface-container-low rounded-xl px-2 py-1 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-none text-on-surface">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-secondary mt-0.5">{user?.role || 'Recruiter'}</p>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around items-center h-16 z-50">
        {[...navItems, { path: '/settings', icon: 'settings', label: 'Settings' }].map(({ path, icon, label }) => {
          const active = pathname === path
          return (
            <button key={path} onClick={() => navigate(path)} className={`flex flex-col items-center gap-0.5 px-3 ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
