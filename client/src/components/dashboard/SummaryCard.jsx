function SummaryCard({ label, value, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-100 bg-white dark:border-dark-border dark:bg-dark-card text-slate-900 dark:text-white shadow-premium',
    green: 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-950/20 dark:bg-emerald-950/5 text-emerald-900 dark:text-emerald-400 shadow-premium',
    red: 'border-rose-100 bg-rose-50/50 dark:border-rose-950/20 dark:bg-rose-950/5 text-rose-900 dark:text-rose-400 shadow-premium',
    blue: 'border-sky-100 bg-sky-50/50 dark:border-indigo-950/20 dark:bg-indigo-950/5 text-sky-900 dark:text-indigo-400 shadow-premium'
  }

  const iconColors = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    blue: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
  }

  const textColors = {
    slate: 'text-slate-800 dark:text-white',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    blue: 'text-indigo-600 dark:text-indigo-400'
  }

  return (
    <div className={`rounded-2xl border p-5 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 dark:text-dark-text-muted tracking-wider uppercase">{label}</p>
        <p className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textColors[tone]}`}>{value}</p>
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${iconColors[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}

export default SummaryCard
