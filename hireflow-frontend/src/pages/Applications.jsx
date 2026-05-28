import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { api } from '../services/api'

const STAGES = ['All', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']
const STAGE_FLOW = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED']

const stageBadge = {
  APPLIED:   'bg-blue-50 text-blue-700 border border-blue-200',
  SCREENING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  INTERVIEW: 'bg-purple-50 text-purple-700 border border-purple-200',
  OFFER:     'bg-green-50 text-green-700 border border-green-200',
  HIRED:     'bg-emerald-100 text-emerald-800 border border-emerald-200',
  REJECTED:  'bg-red-50 text-red-600 border border-red-200',
}

const EMPTY_APP = { candidateName: '', email: '' }

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [activeStage, setActiveStage] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal state
  const [selected, setSelected]     = useState(null)   // candidate detail
  const [showAdd, setShowAdd]        = useState(false)  // add application
  const [newApp, setNewApp]          = useState(EMPTY_APP)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [addLoading, setAddLoading]  = useState(false)
  const [addError, setAddError]      = useState('')

  // Stage update
  const [stageLoading, setStageLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [apps, jobList] = await Promise.all([api.getApplications(), api.getJobs()])
      setApplications(apps)
      setJobs(jobList)
      if (jobList.length > 0) setSelectedJobId(String(jobList[0].id))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = applications.filter(c => {
    const matchStage  = activeStage === 'All' || c.stage === activeStage
    const matchSearch = (c.candidateName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
                        (c.job?.title || '').toLowerCase().includes(search.toLowerCase())
    return matchStage && matchSearch
  })

  // Move stage forward
  const advanceStage = async (app) => {
    const idx = STAGE_FLOW.indexOf(app.stage)
    if (idx === -1 || idx >= STAGE_FLOW.length - 1) return
    const nextStage = STAGE_FLOW[idx + 1]
    setStageLoading(app.id)
    try {
      const updated = await api.updateApplicationStage(app.id, nextStage)
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, stage: updated.stage } : a))
      if (selected?.id === app.id) setSelected(prev => ({ ...prev, stage: updated.stage }))
    } catch (e) { alert('Failed to update stage') }
    finally { setStageLoading(null) }
  }

  // Reject
  const rejectApp = async (app) => {
    if (!window.confirm(`Reject ${app.candidateName}?`)) return
    setStageLoading(app.id)
    try {
      const updated = await api.updateApplicationStage(app.id, 'REJECTED')
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, stage: updated.stage } : a))
      if (selected?.id === app.id) setSelected(prev => ({ ...prev, stage: updated.stage }))
    } catch (e) { alert('Failed to reject') }
    finally { setStageLoading(null) }
  }

  // Set any stage directly
  const setStage = async (app, stage) => {
    setStageLoading(app.id)
    try {
      const updated = await api.updateApplicationStage(app.id, stage)
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, stage: updated.stage } : a))
      if (selected?.id === app.id) setSelected(prev => ({ ...prev, stage: updated.stage }))
    } catch (e) { alert('Failed to update stage') }
    finally { setStageLoading(null) }
  }

  // Add application
  const handleAddApplication = async (e) => {
    e.preventDefault()
    if (!selectedJobId) { setAddError('Please select a job'); return }
    setAddLoading(true); setAddError('')
    try {
      await api.createApplication({ candidateName: newApp.candidateName, email: newApp.email }, selectedJobId)
      setShowAdd(false); setNewApp(EMPTY_APP)
      await fetchAll()
    } catch (err) { setAddError(err.message || 'Failed to add application') }
    finally { setAddLoading(false) }
  }

  // Export CSV
  const exportCSV = () => {
    const header = ['Name', 'Email', 'Job', 'Stage']
    const rows = filtered.map(a => [a.candidateName, a.email, a.job?.title || '', a.stage])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const kpis = [
    { label: 'Total Applicants',   value: applications.length,                                    badge: 'All Time',  badgeColor: 'text-primary bg-primary/10' },
    { label: 'In Interview',        value: applications.filter(a => a.stage === 'INTERVIEW').length, badge: 'Active',   badgeColor: 'text-purple-700 bg-purple-50' },
    { label: 'Offers Extended',     value: applications.filter(a => a.stage === 'OFFER').length,     badge: 'Pending',  badgeColor: 'text-amber-600 bg-amber-50' },
    { label: 'Hired This Month',    value: applications.filter(a => a.stage === 'HIRED').length,     badge: 'Goal: 10', badgeColor: 'text-green-700 bg-green-50' },
  ]

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar />
      <div className="lg:ml-[260px] min-h-screen pb-24 lg:pb-0">
        <TopBar title="Applications" />
        <main className="p-6 lg:p-10 max-w-[1440px] mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Candidate Applications</h2>
              <p className="text-sm text-secondary mt-1">Manage and move candidates through your recruitment pipeline.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-export-csv"
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/50 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>Export CSV
              </button>
              <button
                id="btn-add-application"
                onClick={() => { setShowAdd(true); setAddError('') }}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>Add Candidate
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(({ label, value, badge, badgeColor }) => (
              <div key={label} className="glass-card p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{label}</p>
                <div className="flex items-end justify-between gap-2">
                  <h3 className="text-3xl font-bold text-on-surface">{value}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>{badge}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stage Filter + Search */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex gap-1.5 flex-wrap">
              {STAGES.map(s => (
                <button
                  key={s}
                  id={`filter-stage-${s}`}
                  onClick={() => setActiveStage(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeStage === s ? 'bg-primary text-white shadow-md' : 'bg-white border border-outline-variant/40 text-secondary hover:text-primary hover:border-primary/40'}`}
                >
                  {s === 'All' ? `All (${applications.length})` : s}
                </button>
              ))}
            </div>
            <div className="relative md:ml-auto min-w-[220px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                id="applications-search"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="Search candidates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/60">
                    {['Candidate', 'Applied For', 'Stage', 'Email', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-16 text-secondary text-sm">Loading applications…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16">
                      <span className="material-symbols-outlined text-[48px] text-outline/30 block mb-3">search_off</span>
                      <p className="text-secondary text-sm">No applications found</p>
                    </td></tr>
                  ) : filtered.map(c => (
                    <tr
                      key={c.id}
                      className="group hover:bg-primary/[0.03] transition-colors cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-primary/10 text-primary flex-shrink-0">
                            {(c.candidateName || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{c.candidateName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">{c.job?.title || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${stageBadge[c.stage] || 'bg-surface-container-high text-secondary'}`}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">{c.email}</td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          {/* Advance stage */}
                          {STAGE_FLOW.indexOf(c.stage) < STAGE_FLOW.length - 1 && (
                            <button
                              id={`btn-advance-${c.id}`}
                              onClick={() => advanceStage(c)}
                              disabled={stageLoading === c.id}
                              title="Advance Stage"
                              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                          )}
                          {/* Reject */}
                          {c.stage !== 'REJECTED' && c.stage !== 'HIRED' && (
                            <button
                              id={`btn-reject-${c.id}`}
                              onClick={() => rejectApp(c)}
                              disabled={stageLoading === c.id}
                              title="Reject"
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          )}
                          {/* View detail */}
                          <button
                            id={`btn-view-${c.id}`}
                            onClick={() => setSelected(c)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-surface-container text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── Candidate Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {(selected.candidateName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{selected.candidateName}</h3>
                  <p className="text-sm text-secondary">{selected.email}</p>
                </div>
              </div>
              <button id="modal-close" onClick={() => setSelected(null)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">Applied For</span>
                <span className="text-sm font-semibold text-on-surface">{selected.job?.title || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">Current Stage</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${stageBadge[selected.stage] || ''}`}>{selected.stage}</span>
              </div>

              {/* Pipeline Progress */}
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Pipeline Progress</p>
                <div className="flex gap-1.5 flex-wrap">
                  {STAGE_FLOW.map((s, i) => {
                    const currIdx = STAGE_FLOW.indexOf(selected.stage)
                    const done    = i < currIdx
                    const active  = i === currIdx
                    return (
                      <button
                        key={s}
                        id={`modal-stage-${s}`}
                        onClick={() => setStage(selected, s)}
                        disabled={stageLoading === selected.id}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                          active  ? 'bg-primary text-white shadow-md' :
                          done    ? 'bg-primary/20 text-primary' :
                                    'bg-surface-container-high text-secondary hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-5 border-t border-outline-variant/20 flex gap-3">
              {STAGE_FLOW.indexOf(selected.stage) < STAGE_FLOW.length - 1 && (
                <button
                  id="modal-advance"
                  onClick={() => advanceStage(selected)}
                  disabled={stageLoading === selected.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  Move to {STAGE_FLOW[STAGE_FLOW.indexOf(selected.stage) + 1]}
                </button>
              )}
              {selected.stage !== 'REJECTED' && selected.stage !== 'HIRED' && (
                <button
                  id="modal-reject"
                  onClick={() => rejectApp(selected)}
                  disabled={stageLoading === selected.id}
                  className="px-5 py-3 border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Application Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl w-full max-w-md shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Add Candidate</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>{addError}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Full Name</label>
                <input
                  id="add-candidate-name"
                  required
                  className="w-full px-4 py-3 bg-white border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="Jane Doe"
                  value={newApp.candidateName}
                  onChange={e => setNewApp({ ...newApp, candidateName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Email</label>
                <input
                  id="add-candidate-email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-white border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="jane@email.com"
                  value={newApp.email}
                  onChange={e => setNewApp({ ...newApp, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Job Position</label>
                <select
                  id="add-candidate-job"
                  required
                  className="w-full px-4 py-3 bg-white border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                >
                  {jobs.filter(j => j.status === 'OPEN').map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                  {jobs.filter(j => j.status === 'OPEN').length === 0 && (
                    <option disabled value="">No open jobs</option>
                  )}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-outline-variant rounded-xl text-sm font-medium text-secondary hover:bg-surface-container transition-all">Cancel</button>
                <button
                  id="btn-submit-application"
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {addLoading ? 'Adding…' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
