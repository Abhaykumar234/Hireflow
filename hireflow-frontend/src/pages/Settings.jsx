import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { api } from '../services/api'

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [applicationAlerts, setApplicationAlerts] = useState(true)

  // Password form state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    setFullName(u.fullName || '')
    setEmail(u.email || '')
    setEmailNotifications(u.emailNotificationsEnabled !== false)
    setApplicationAlerts(u.applicationAlertsEnabled !== false)
  }, [navigate])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    try {
      const updated = await api.updateUser(user.id, {
        fullName,
        email,
        emailNotificationsEnabled: emailNotifications,
        applicationAlertsEnabled: applicationAlerts,
        role: user.role,
      })
      const merged = { ...user, ...updated }
      localStorage.setItem('user', JSON.stringify(merged))
      setUser(merged)
      setProfileMsg({ type: 'success', text: 'Profile and preferences saved successfully!' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }
    setPasswordLoading(true)
    try {
      await api.updatePassword(user.id, oldPassword, newPassword)
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', icon: 'person', label: 'Profile' },
    { id: 'security', icon: 'lock', label: 'Security' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  ]

  if (!user) return null

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
        <TopBar title="Settings" user={user} />
        <div className="p-8 max-w-[900px] mx-auto">

          {/* Page Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-on-surface">Account Settings</h2>
            <p className="text-base text-secondary mt-1">Manage your profile, security, and notification preferences.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-8 p-1 bg-surface-container-low rounded-xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); setProfileMsg(null); setPasswordMsg(null) }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* === PROFILE TAB === */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* Avatar Section */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-base font-semibold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_circle</span>
                  Profile Details
                </h3>

                {profileMsg && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    profileMsg.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-error-container/20 border border-error/20 text-error'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {profileMsg.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {profileMsg.text}
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {(fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{fullName}</p>
                    <p className="text-xs text-secondary mt-0.5">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Full Name</label>
                    <input
                      id="settings-fullname"
                      className="w-full px-4 py-3 bg-white/60 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email Address</label>
                    <input
                      id="settings-email"
                      type="email"
                      className="w-full px-4 py-3 bg-white/60 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role</label>
                    <input
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm text-secondary cursor-not-allowed"
                      value={user.role}
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    id="settings-save-profile"
                    type="submit"
                    disabled={profileLoading}
                    className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {profileLoading
                      ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Saving...</>
                      : <><span className="material-symbols-outlined text-[18px]">save</span> Save Changes</>
                    }
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* === SECURITY TAB === */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSave} className="space-y-6">
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-base font-semibold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield</span>
                  Change Password
                </h3>

                {passwordMsg && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    passwordMsg.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-error-container/20 border border-error/20 text-error'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {passwordMsg.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {passwordMsg.text}
                  </div>
                )}

                <div className="space-y-5 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Current Password</label>
                    <input
                      id="settings-old-password"
                      type="password"
                      className="w-full px-4 py-3 bg-white/60 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">New Password</label>
                    <input
                      id="settings-new-password"
                      type="password"
                      className="w-full px-4 py-3 bg-white/60 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Confirm New Password</label>
                    <input
                      id="settings-confirm-password"
                      type="password"
                      className="w-full px-4 py-3 bg-white/60 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-start">
                  <button
                    id="settings-save-password"
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {passwordLoading
                      ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Updating...</>
                      : <><span className="material-symbols-outlined text-[18px]">lock_reset</span> Update Password</>
                    }
                  </button>
                </div>
              </div>

              {/* Security info card */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Tips for a strong password</p>
                  <ul className="mt-2 space-y-1 text-xs text-secondary list-disc list-inside">
                    <li>At least 8 characters long</li>
                    <li>Mix of uppercase, lowercase, numbers and symbols</li>
                    <li>Avoid reusing passwords from other services</li>
                  </ul>
                </div>
              </div>
            </form>
          )}

          {/* === NOTIFICATIONS TAB === */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-base font-semibold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                  Notification Preferences
                </h3>
                <p className="text-sm text-secondary mb-8">Control which activity triggers a notification in your HireFlow account.</p>

                {profileMsg && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    profileMsg.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-error-container/20 border border-error/20 text-error'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {profileMsg.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {profileMsg.text}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Toggle Row */}
                  {[
                    {
                      id: 'toggle-email-notif',
                      icon: 'mail',
                      label: 'Email Notifications',
                      desc: 'Receive in-app notifications for email activity',
                      value: emailNotifications,
                      setter: setEmailNotifications,
                    },
                    {
                      id: 'toggle-app-alerts',
                      icon: 'person_add',
                      label: 'Application Alerts',
                      desc: 'Get notified when candidates apply or change pipeline stage',
                      value: applicationAlerts,
                      setter: setApplicationAlerts,
                    },
                  ].map(({ id, icon, label, desc, value, setter }) => (
                    <div key={id} className="flex items-center justify-between p-5 rounded-xl bg-white/50 border border-white/40 shadow-sm hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl transition-colors ${value ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                          <span className={`material-symbols-outlined text-[20px] ${value ? 'text-primary' : 'text-secondary'}`}>{icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{label}</p>
                          <p className="text-xs text-secondary mt-0.5">{desc}</p>
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <button
                        id={id}
                        type="button"
                        onClick={() => setter(v => !v)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${value ? 'bg-primary' : 'bg-outline-variant'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    id="settings-save-notifications"
                    type="submit"
                    disabled={profileLoading}
                    className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {profileLoading
                      ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Saving...</>
                      : <><span className="material-symbols-outlined text-[18px]">save</span> Save Preferences</>
                    }
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  )
}
