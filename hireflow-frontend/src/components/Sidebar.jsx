import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/jobs', icon: 'work', label: 'Jobs' },
  { path: '/applications', icon: 'group', label: 'Applications' },
  { path: '/analytics', icon: 'analytics', label: 'Analytics' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[260px] z-50 py-8 bg-white/80 backdrop-blur-xl border-r border-white/40 shadow-md">
      {/* Logo */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">HireFlow</h1>
            <p className="text-xs text-secondary">Recruitment Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ path, icon, label }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              id={`sidebar-nav-${label.toLowerCase()}`}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 mt-auto space-y-1">
        <button
          id="sidebar-post-job"
          onClick={() => navigate('/jobs')}
          className="w-full bg-primary text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Post New Job
        </button>

        <div className="border-t border-outline-variant/20 pt-2">
          <button
            id="sidebar-help"
            onClick={() => window.open('https://hireflow.com/help', '_blank')}
            className="w-full flex items-center gap-3 text-secondary px-4 py-3 rounded-xl hover:bg-surface-container-low hover:text-on-surface transition-all text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>Help Center
          </button>
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-secondary px-4 py-3 rounded-xl hover:bg-red-50 hover:text-error transition-all text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
