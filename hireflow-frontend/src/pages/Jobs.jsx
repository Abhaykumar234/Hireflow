import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { api } from '../services/api'

const EMPTY_JOB = { title: '', company: 'HireFlow Corp', location: '', status: 'OPEN' }

export default function Jobs() {
  const [jobs, setJobs]           = useState([])
  const [filter, setFilter]       = useState('All Jobs')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editJob, setEditJob]     = useState(null)   // null = create mode, obj = edit mode
  const [form, setForm]           = useState(EMPTY_JOB)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId]   = useState(null)   // confirm delete

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try { setJobs(await api.getJobs()) } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = jobs.filter(j => {
    const matchTab    = filter === 'All Jobs' || (filter === 'Active' && j.status === 'OPEN') || (filter === 'Archived' && j.status === 'CLOSED')
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const openCreate = () => { setEditJob(null); setForm(EMPTY_JOB); setFormError(''); setShowModal(true) }
  const openEdit   = (j) => { setEditJob(j); setForm({ title: j.title, company: j.company, location: j.location, status: j.status }); setFormError(''); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Job title is required'); return }
    setFormLoading(true); setFormError('')
    try {
      if (editJob) {
        // Update existing (use PUT via createJob reusing since no dedicated update in api.js — we call createJob for new, or we use updateApplicationStage for stage)
        // We'll POST to /jobs for create, and for edit we close and do a targeted update
        const res = await fetch(`http://localhost:8080/jobs/${editJob.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, applicants: editJob.applicants || 0 }),
        })
        if (!res.ok) throw new Error('Failed to update job')
      } else {
        await api.createJob({ ...form, applicants: 0 })
      }
      setShowModal(false)
      await fetchJobs()
    } catch (err) { setFormError(err.message || 'Something went wrong') }
    finally { setFormLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/jobs/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      await fetchJobs()
    } catch { alert('Failed to delete job') }
  }

  const toggleStatus = async (j) => {
    try {
      const newStatus = j.status === 'OPEN' ? 'CLOSED' : 'OPEN'
      await fetch(`http://localhost:8080/jobs/${j.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...j, status: newStatus }),
      })
      await fetchJobs()
    } catch { alert('Failed to toggle status') }
  }

  const kpis = [
    { icon: 'work',         color: 'text-primary bg-primary/10',          label: 'Total Positions',  value: jobs.length },
    { icon: 'check_circle', color: 'text-green-700 bg-green-50',           label: 'Open Positions',   value: jobs.filter(j => j.status === 'OPEN').length },
    { icon: 'group',        color: 'text-purple-700 bg-purple-50',         label: 'Total Applicants', value: jobs.reduce((s, j) => s + (j.applicants || 0), 0) },
    { icon: 'archive',      color: 'text-secondary bg-surface-container-high', label: 'Archived',     value: jobs.filter(j => j.status === 'CLOSED').length },
  ]

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar />
      <div className="lg:ml-[260px] min-h-screen pb-24 lg:pb-0">
        <TopBar title="Jobs" />
        <main className="p-6 lg:p-10 max-w-[1440px] mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Job Listings</h2>
              <p className="text-sm text-secondary mt-1">Create, manage and track all your recruitment positions.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-xl border border-white/40 shadow-sm">
                {['All Jobs', 'Active', 'Archived'].map(tab => (
                  <button
                    key={tab}
                    id={`jobs-tab-${tab}`}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab ? 'bg-white shadow-sm text-primary font-semibold' : 'text-secondary hover:text-primary'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                id="btn-post-job"
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>Post Job
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(({ icon, color, label, value }) => (
              <div key={label} className="glass-card p-5 rounded-2xl shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <p className="text-xs text-secondary uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-on-surface mt-1">{value}</h3>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              id="jobs-search"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              placeholder="Search by title or company…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/60">
                    {['Job Title', 'Company', 'Location', 'Applicants', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-16 text-secondary text-sm">Loading jobs…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16">
                      <span className="material-symbols-outlined text-[48px] text-outline/30 block mb-3">work_off</span>
                      <p className="text-secondary text-sm">No jobs found. <button onClick={openCreate} className="text-primary font-semibold hover:underline">Post one now</button></p>
                    </td></tr>
                  ) : filtered.map(j => (
                    <tr key={j.id} className="group hover:bg-primary/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-[18px]">work</span>
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{j.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">{j.company}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{j.location || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-on-surface">{j.applicants || 0}</td>
                      <td className="px-6 py-4">
                        <button
                          id={`btn-toggle-status-${j.id}`}
                          onClick={() => toggleStatus(j)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer transition-all hover:opacity-80 ${j.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-surface-container-high text-secondary'}`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${j.status === 'OPEN' ? 'bg-green-500' : 'bg-secondary'}`} />
                          {j.status}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          <button
                            id={`btn-edit-job-${j.id}`}
                            onClick={() => openEdit(j)}
                            title="Edit"
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            id={`btn-delete-job-${j.id}`}
                            onClick={() => setDeleteId(j.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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

      {/* ── Create / Edit Job Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-on-surface">{editJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>{formError}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Job Title *</label>
                <input
                  id="job-form-title"
                  required
                  className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="e.g. Senior Backend Engineer"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Company</label>
                <input
                  id="job-form-company"
                  className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="e.g. HireFlow Corp"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Location</label>
                <input
                  id="job-form-location"
                  className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="e.g. Remote • Full-time"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Status</label>
                <select
                  id="job-form-status"
                  className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed / Archived</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-outline-variant rounded-xl text-sm font-medium text-secondary hover:bg-surface-container transition-all">Cancel</button>
                <button
                  id="btn-submit-job"
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Saving…' : editJob ? 'Save Changes' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-symbols-outlined text-[48px] text-error mb-4 block">delete_forever</span>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete Job?</h3>
            <p className="text-sm text-secondary mb-6">This will permanently remove the job listing. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-outline-variant rounded-xl text-sm font-medium text-secondary hover:bg-surface-container transition-all">Cancel</button>
              <button
                id="btn-confirm-delete"
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 bg-error text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
