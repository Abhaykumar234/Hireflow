import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { api } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ jobs: [], apps: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobs, apps] = await Promise.all([api.getJobs(), api.getApplications()])
        setStats({ jobs, apps })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const interviews = [
    { name: 'Liam Carter', role: 'Tech Lead Interview', time: '14:00', method: 'videocam', methodLabel: 'Google Meet', timeColor: 'bg-primary-container text-white' },
    { name: 'Emma Thompson', role: 'HR Screening', time: '15:30', method: 'call', methodLabel: 'Phone Call', timeColor: 'bg-surface-container-high text-on-surface-variant' },
    { name: 'Noah Garcia', role: 'System Design Round', time: 'TOMORROW', method: 'apartment', methodLabel: 'In-Person • Office 4B', timeColor: 'bg-surface-container-high text-on-surface-variant' },
  ]

  const kpis = [
    { icon: 'description', label: 'Total Applications', value: stats.apps?.length || 0, badge: '+12%', badgeColor: 'text-green-600 bg-green-100' },
    { icon: 'work_outline', label: 'Open Jobs', value: (stats.jobs || []).filter(j => j.status === 'OPEN').length, badge: 'Active', badgeColor: 'text-primary bg-primary-container/10' },
    { icon: 'event', label: 'Interviews Scheduled', value: (stats.apps || []).filter(a => a.stage === 'INTERVIEW').length, badge: 'Active', badgeColor: 'text-secondary bg-surface-container-high' },
    { icon: 'person_add', label: 'Hired Total', value: (stats.apps || []).filter(a => a.stage === 'HIRED').length, badge: 'Goal: 10', badgeColor: 'text-green-600 bg-green-100' },
  ]

  const recentActivities = (stats.apps || []).slice(-3).reverse().map(app => ({
    name: app.candidateName || 'Unknown',
    action: 'applied for',
    role: app.job ? app.job.title : 'Position',
    time: 'Recently',
    initials: (app.candidateName || 'U').charAt(0),
    color: 'bg-primary/10 text-primary'
  }))
  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
        <TopBar title="Dashboard" />
        <div className="p-8 max-w-[1440px] mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-on-surface">Recruiter Overview</h2>
            <p className="text-base text-secondary">Welcome back, Marcus. Here's what's happening with your pipeline today.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {kpis.map(({ icon, label, value, badge, badgeColor }) => (
              <div key={label} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-container/10 rounded-xl">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-xs text-secondary uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-on-surface mt-1">{value}</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Bottom bento */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <div className="xl:col-span-2 glass-card rounded-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-on-surface">Recent Activity</h3>
                <button className="text-primary text-sm hover:underline">View All</button>
              </div>
              <div className="space-y-6">
                {loading ? (
                  <p className="text-sm text-secondary">Loading activity...</p>
                ) : recentActivities.length === 0 ? (
                  <p className="text-sm text-secondary">No recent activity.</p>
                ) : recentActivities.map(({ name, action, role, time, initials, color, isSystem }) => (
                  <div key={name + time} className="flex gap-4 p-4 rounded-xl hover:bg-primary-container/5 transition-colors border border-transparent hover:border-primary-container/10">
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm ${color}`}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-on-surface">
                        <span className="font-semibold text-primary">{name}</span>{' '}
                        {action}{' '}
                        <span className="font-semibold">{role}</span>
                      </p>
                      <p className="text-xs text-secondary mt-1">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interviews */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-on-surface">Interviews</h3>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {interviews.map(({ name, role, time, method, methodLabel, timeColor }) => (
                  <div key={name} className="p-4 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{name}</p>
                        <p className="text-xs text-secondary">{role}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${timeColor}`}>{time}</div>
                    </div>
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-[16px]">{method}</span>
                      <span className="text-xs">{methodLabel}</span>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-4 py-3 border-2 border-dashed border-outline-variant/50 rounded-xl text-secondary text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                  + Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
