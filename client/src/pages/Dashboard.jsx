import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts'
import SummaryCard from '../components/dashboard/SummaryCard'
import { getDashboardSummary } from '../services/dashboardService'
import { saveTransaction } from '../redux/slices/transactionSlice'
import { formatCurrency, formatDate, categories, paymentMethods } from '../utils/format'
import { FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiActivity, FiTrendingUp, FiPlus, FiCheck } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { motion } from 'framer-motion'

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10)
}

function Dashboard() {
  const dispatch = useDispatch()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Quick Add Form States
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadDashboard = () => {
    setLoading(true)
    getDashboardSummary()
      .then((response) => setSummary(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setMessage('')
    setFormLoading(true)
    try {
      await dispatch(saveTransaction({ id: null, data: form })).unwrap()
      setShowForm(false)
      setForm(emptyForm)
      // Reload dashboard charts & counters instantly
      const response = await getDashboardSummary()
      setSummary(response.data.data)
    } catch (err) {
      setMessage(err || 'Failed to save transaction')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-rose-700 shadow-premium">
        <p className="font-semibold text-lg">Error Loading Dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  const trend = summary?.monthlyTrend || []
  const categoriesList = summary?.categoryBreakdown || []
  const incomeExpense = trend.map((item) => ({
    month: item.month,
    Income: item.income,
    Expense: item.expense
  }))

  const isDark = theme === 'dark'
  const gridStroke = isDark ? '#222533' : '#f1f5f9'
  const textStroke = isDark ? '#475569' : '#94a3b8'
  const tooltipStyle = isDark
    ? { backgroundColor: '#13141f', borderRadius: '12px', border: '1px solid #222533', color: '#fff' }
    : { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }
  const tooltipItemStyle = { color: isDark ? '#f8fafc' : '#0f172a' }
  const tooltipLabelStyle = { color: isDark ? '#94a3b8' : '#64748b' }

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Premium Hero Balance Section */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#131522] dark:to-[#0d0f17] p-6 md:p-8 shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[200px]">
        {/* Subtle glow accent */}
        <div className="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        {/* Top/Right glowing light effect matching references */}
        <div className="absolute right-12 top-0 w-48 h-48 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 z-10">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">{t('totalBalance')}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                {summary ? formatCurrency(summary.savings).split('.')[0] : '₹0'}
              </h2>
              <span className="text-lg md:text-xl font-bold text-slate-450 dark:text-dark-text-muted">
                .{summary ? formatCurrency(summary.savings).split('.')[1] || '00' : '00'}
              </span>
              <span className="ml-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 px-2 py-0.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                🇮🇳 INR
              </span>
            </div>
            
            {/* Money hold pill */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-550 dark:text-dark-text-muted">
              <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                Money hold: {summary ? formatCurrency(summary.totalIncome * 0.12) : '₹0'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                Daily Limit: {formatCurrency(25000)}
              </span>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0">
            <button
              id="add-transaction-btn-tour"
              onClick={() => { setMessage(''); setForm({ ...form, type: 'expense' }); setShowForm(true) }}
              className="flex items-center justify-center gap-2 rounded-full bg-[#743BF7] hover:bg-[#602ee3] dark:bg-[#8B5CF6] dark:hover:bg-[#784ce3] px-8 py-4 font-black text-white text-sm shadow-xl shadow-purple-500/25 dark:shadow-purple-600/30 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <FiPlus className="w-4 h-4 stroke-[3px]" />
              {t('addTransaction')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label={t('totalIncome')}
            value={formatCurrency(summary.totalIncome)}
            icon={FiArrowUpRight}
            tone="green"
          />
          <SummaryCard
            label={t('totalExpense')}
            value={formatCurrency(summary.totalExpense)}
            icon={FiArrowDownRight}
            tone="red"
          />
          <SummaryCard
            label={t('budgetSetup')}
            value={formatCurrency(summary.budgetRemaining)}
            icon={FiActivity}
            tone="blue"
          />
          <SummaryCard
            label={t('netSavings')}
            value={formatCurrency(summary.savings)}
            icon={FiDollarSign}
            tone="slate"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Trend Chart */}
        <section className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#131522] dark:to-[#0d0f17] p-6 shadow-premium lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="w-5 h-5 text-secondary dark:text-purple-400" />
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t('monthlyTrend')}</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tickLine={false} stroke={textStroke} fontSize={12} />
                <YAxis tickLine={false} stroke={textStroke} fontSize={12} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Area type="monotone" dataKey="expense" stroke="#a855f7" strokeWidth={3.5} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Category Share Donut Chart */}
        <section className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#131522] dark:to-[#0d0f17] p-6 shadow-premium">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{t('spendingByCat')}</h3>
          <div className="h-72 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoriesList} dataKey="amount" nameKey="category" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {categoriesList.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            {categoriesList.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                No data available
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Comparisons & Recent Listings Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Bar Chart */}
        <section className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#131522] dark:to-[#0d0f17] p-6 shadow-premium lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{t('incomeVsExpense')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tickLine={false} stroke={textStroke} fontSize={12} />
                <YAxis tickLine={false} stroke={textStroke} fontSize={12} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Transactions List */}
        <section className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#131522] dark:to-[#0d0f17] p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{t('recentTransactions')}</h3>
            <div className="space-y-4">
              {summary?.recentTransactions?.length ? (
                summary.recentTransactions.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-xs font-semibold ${
                        item.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450'
                      }`}>
                        {item.type === 'income' ? 'IN' : 'EX'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-400 dark:text-dark-text-muted font-medium">
                          {item.category} • {formatDate(item.transactionDate)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${
                      item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Quick Add Overlay Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-dark-border">
            <header className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-slate-50/50 dark:bg-dark-card/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('newTransaction')}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg transition-colors cursor-pointer"
              >
                &times;
              </button>
            </header>

            <form onSubmit={submitForm} className="p-6 space-y-4">
              {message && <div className="rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/10 p-3 text-xs text-rose-700 dark:text-rose-400">{message}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('typeLabel')}</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    <option value="expense">{t('expense')}</option>
                    <option value="income">{t('income')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('amountLabel')}</label>
                  <input
                    type="number"
                    name="amount"
                    min="0.01"
                    step="any"
                    value={form.amount}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('titleLabel')}</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('category')}</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('paymentMethod')}</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary capitalize cursor-pointer"
                  >
                    {paymentMethods.map((p) => (
                      <option key={p} value={p}>{p.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('transactionDate')}</label>
                <input
                  type="date"
                  name="transactionDate"
                  value={form.transactionDate}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('descriptionLabel')}</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary"
                />
              </div>

              <footer className="pt-4 border-t border-slate-100 dark:border-dark-border flex justify-end gap-3 bg-slate-50/50 dark:bg-dark-card/50 -mx-6 -mb-6 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary dark:bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 dark:hover:bg-purple-700 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  {formLoading ? 'Saving...' : t('saveChanges')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard