import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fetchInsights, fetchPrediction } from '../redux/slices/insightSlice'
import { downloadMonthlyReport, getMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'
import { 
  FiTrendingUp, 
  FiCpu, 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiDownload, 
  FiCalendar, 
  FiLayers 
} from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

function InsightsReports() {
  const dispatch = useDispatch()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState('insights') // 'insights' or 'reports'

  // Insights (AI) Redux Selector
  const { insights, predictions, provider, loading: aiLoading, error: aiError } = useSelector(state => state.insights)

  // Reports State
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(true)
  const [reportError, setReportError] = useState('')

  const reportParams = useMemo(() => period, [period])

  // Fetch AI insights
  useEffect(() => {
    if (activeTab === 'insights') {
      dispatch(fetchInsights())
      dispatch(fetchPrediction())
    }
  }, [dispatch, activeTab])

  // Fetch monthly report
  useEffect(() => {
    if (activeTab === 'reports') {
      setReportLoading(true)
      getMonthlyReport(reportParams)
        .then((response) => setReport(response.data.data))
        .catch((err) => setReportError(err.response?.data?.message || 'Unable to load report'))
        .finally(() => setReportLoading(false))
    }
  }, [reportParams, activeTab])

  const exportPdf = async () => {
    try {
      const response = await downloadMonthlyReport(reportParams)
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finance-report-${period.year}-${String(period.month).padStart(2, '0')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export PDF statement')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t('spendingInsights')}</h2>
          <p className="text-slate-400 dark:text-dark-text-muted text-sm mt-0.5">{t('insightsSubtitle')}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-dark p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white dark:bg-dark-card text-secondary dark:text-purple-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiCpu className="w-4 h-4" />
            {t('aiForecast')}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-dark-card text-secondary dark:text-purple-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiLayers className="w-4 h-4" />
            Monthly Reports
          </button>
        </div>
      </div>

      {/* AI INSIGHTS VIEW */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-fadeIn">
          {aiError && <div className="rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/10 p-4 text-sm text-rose-700 dark:text-rose-400">{aiError}</div>}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Suggestions Card */}
            <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                <div className="flex items-center gap-2">
                  <FiCpu className="w-5 h-5 text-secondary dark:text-purple-400" />
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">AI Financial Advice</h3>
                </div>
                <button
                  onClick={() => { dispatch(fetchInsights()); dispatch(fetchPrediction()) }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-3 py-1.5 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {aiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary dark:border-purple-400"></div>
                  Generating AI insights...
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.length ? insights.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl border border-indigo-50/30 dark:border-purple-950/20 bg-indigo-50/10 dark:bg-purple-950/5 p-4 text-slate-700 dark:text-slate-300 hover:bg-indigo-50/20 dark:hover:bg-purple-950/10 transition-colors">
                      <FiCheckCircle className="w-5 h-5 text-secondary dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium leading-relaxed">{item}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
                      Record more transactions to unlock AI insights recommendations.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Forecast Panel */}
            <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium h-fit space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-dark-border">
                <FiTrendingUp className="w-5 h-5 text-secondary dark:text-purple-400" />
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t('aiForecast')}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Projected Outflows</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                    {formatCurrency(predictions.predictedExpense || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Confidence Level</p>
                  <div className="mt-2">
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-dark overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${predictions.confidence || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-1">
                      <span>{predictions.confidence || 0}% Accuracy</span>
                      <span className="text-slate-400 dark:text-dark-text-muted">Dynamic model</span>
                    </div>
                  </div>
                </div>

                {predictions.budgetRisk && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 dark:border-amber-950/30 bg-amber-50/50 dark:bg-amber-950/10 p-4 text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                    <FiAlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                    Warning: Projected month outflows exceed your global monthly limit. Consider restricting discretionary categories immediately.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* STATEMENTS & PDF REPORTS VIEW */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fadeIn">
          {reportError && <div className="rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/10 p-4 text-sm text-rose-700 dark:text-rose-400">{reportError}</div>}

          {/* Period Filter Card */}
          <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-premium flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <FiCalendar className="text-secondary dark:text-purple-400 w-5 h-5 flex-shrink-0" />
              <div className="grid gap-3 grid-cols-2 flex-1 md:w-72">
                <select
                  value={period.month}
                  onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {new Date(2024, index, 1).toLocaleString('en-IN', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={period.year}
                  onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  placeholder="Year"
                />
              </div>
            </div>
            
            <button
              onClick={exportPdf}
              disabled={reportLoading || !report}
              className="flex items-center justify-center gap-2 rounded-xl bg-secondary dark:bg-purple-600 px-4 py-2.5 font-bold text-white text-sm hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 w-full md:w-auto cursor-pointer"
            >
              <FiDownload className="w-4 h-4" />
              Download Report
            </button>
          </section>

          {reportLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary dark:border-purple-400"></div>
              Generating statement report...
            </div>
          )}

          {report && !reportLoading && (
            <>
              {/* Summary Metric Counters */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-premium flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Statement Income</span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(report.totalIncome)}</span>
                </div>
                <div className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-premium flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Statement Expenses</span>
                  <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-455 mt-2">{formatCurrency(report.totalExpense)}</span>
                </div>
                <div className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-premium flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Period Savings</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2">{formatCurrency(report.savings)}</span>
                </div>
                <div className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-premium flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Remaining Budget</span>
                  <span className="text-2xl font-extrabold text-indigo-650 dark:text-purple-400 mt-2">{formatCurrency(report.budgetRemaining)}</span>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Category Spend Chart */}
                <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium lg:col-span-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Category Analysis</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-dark-border" />
                        <XAxis dataKey="category" tickLine={false} stroke="#94a3b8" fontSize={11} />
                        <YAxis tickLine={false} stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={isDark
                            ? { backgroundColor: '#13141f', borderRadius: '12px', border: '1px solid #222533', color: '#fff' }
                            : { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }
                          }
                          itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                          labelStyle={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* List of Statement Transactions */}
                <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Period Logs</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {report.transactions.length ? report.transactions.map((item) => (
                        <div key={item._id} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[150px]">{item.title}</p>
                            <p className="text-xs text-slate-400 dark:text-dark-text-muted font-medium">{item.category} • {formatDate(item.transactionDate)}</p>
                          </div>
                          <p className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 py-12 text-center">
                          No records exist for this period.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default InsightsReports
