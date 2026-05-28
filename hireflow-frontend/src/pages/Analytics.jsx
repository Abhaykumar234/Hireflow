import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

const funnel = [
  { stage: 'Applications', count: 1284, pct: 100, color: 'bg-primary' },
  { stage: 'Screening', count: 642, pct: 50, color: 'bg-primary/80' },
  { stage: 'Interview', count: 214, pct: 16.7, color: 'bg-tertiary' },
  { stage: 'Offer', count: 48, pct: 3.7, color: 'bg-tertiary/80' },
  { stage: 'Hired', count: 32, pct: 2.5, color: 'bg-green-500' },
]

const sources = [
  { source: 'LinkedIn', count: 512, pct: 40, color: 'bg-[#0077b5]' },
  { source: 'Indeed', count: 384, pct: 30, color: 'bg-[#003A9B]' },
  { source: 'Referral', count: 256, pct: 20, color: 'bg-tertiary' },
  { source: 'Company Site', count: 132, pct: 10.3, color: 'bg-secondary' },
]

const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const hires = [8, 12, 6, 15, 9, 7]
const maxHires = Math.max(...hires)

export default function Analytics() {
  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar />
      <div className="lg:pl-[260px] min-h-screen pb-20 lg:pb-0">
        <TopBar user={{ name: 'Alex Sterling', role: 'Admin' }} />
        <main className="p-10 max-w-[1440px] mx-auto">
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-primary mb-2">Recruitment Insights</h2>
            <p className="text-base text-secondary">Real-time performance metrics and hiring funnel analysis.</p>
          </header>

          {/* KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { icon: 'person_add', label: 'Total Hires', value: '1,284', badge: '↑ 12%', bdColor: 'text-emerald-600 bg-emerald-50' },
              { icon: 'schedule', label: 'Avg. Time to Hire', value: '18d', badge: '↓ 4 days', bdColor: 'text-emerald-600 bg-emerald-50' },
              { icon: 'handshake', label: 'Offer Accept Rate', value: '94%', badge: '↑ 2%', bdColor: 'text-emerald-600 bg-emerald-50' },
              { icon: 'groups', label: 'Active Pipelines', value: '42', badge: '8 new', bdColor: 'text-amber-600 bg-amber-50' },
            ].map(({ icon, label, value, badge, bdColor }) => (
              <div key={label} className="glass-card p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>{icon}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${bdColor}`}>{badge}</span>
                </div>
                <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-on-surface">{value}</h3>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Hiring Funnel */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-on-surface mb-6">Hiring Funnel</h3>
              <div className="space-y-4">
                {funnel.map(({ stage, count, pct, color }) => (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface">{stage}</span>
                      <span className="text-secondary">{count.toLocaleString()} <span className="text-xs">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Hires Bar Chart */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-on-surface mb-6">Monthly Hires</h3>
              <div className="flex items-end gap-4 h-44">
                {months.map((m, i) => (
                  <div key={m} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-on-surface">{hires[i]}</span>
                    <div
                      className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                      style={{ height: `${(hires[i] / maxHires) * 140}px` }}
                    />
                    <span className="text-xs text-secondary">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Application Sources</h3>
            <div className="space-y-4">
              {sources.map(({ source, count, pct, color }) => (
                <div key={source} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium text-on-surface">{source}</span>
                  <div className="flex-1 bg-surface-container-high rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 text-right text-sm text-secondary">{count} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
