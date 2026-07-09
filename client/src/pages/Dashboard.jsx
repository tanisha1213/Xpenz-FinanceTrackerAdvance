import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-indigo-950 dark:from-purple-900/30 dark:to-indigo-950/30 border dark:border-purple-500/10 p-6 md:p-8 text-white shadow-xl backdrop-blur-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome Back to Xpenz</h2>
            <p className="text-slate-300 dark:text-slate-400 text-sm md:text-base font-normal">
              Analyze spending patterns, manage active budgets, and discover smart financial recommendations.
            </p>
          </div>
          <button
            onClick={() => { setMessage(''); setShowForm(true) }}
            className="flex items-center justify-center gap-2 rounded-xl bg-white text-primary px-5 py-3 font-extrabold text-sm hover:bg-slate-100 shadow-lg transition-all w-fit flex-shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform skew-x-12 hidden md:block" />
      </div>

      {/* Summary Stats Grid */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Income"
            value={formatCurrency(summary.totalIncome)}
            icon={FiArrowUpRight}
            tone="green"
          />
          <SummaryCard
            label="Total Expense"
            value={formatCurrency(summary.totalExpense)}
            icon={FiArrowDownRight}
            tone="red"
          />
          <SummaryCard
            label="Remaining Budget"
            value={formatCurrency(summary.budgetRemaining)}
            icon={FiActivity}
            tone="blue"
          />
          <SummaryCard
            label="Net Savings"
            value={formatCurrency(summary.savings)}
            icon={FiDollarSign}
            tone="slate"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Trend Chart */}
        <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="w-5 h-5 text-secondary dark:text-purple-400" />
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Monthly Spending Trend</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tickLine={false} stroke={textStroke} fontSize={12} />
                <YAxis tickLine={false} stroke={textStroke} fontSize={12} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Line type="monotone" dataKey="expense" stroke="#a855f7" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Category Share Donut Chart */}
        <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Category Distribution</h3>
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
        <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Income vs Expense Comparison</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tickLine={false} stroke={textStroke} fontSize={12} />
                <YAxis tickLine={false} stroke={textStroke} fontSize={12} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Transactions List */}
        <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {summary?.recentTransactions?.length ? (
                summary.recentTransactions.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-xs font-semibold ${
                        item.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
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
                      item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quick Add Transaction</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg transition-colors"
              >
                &times;
              </button>
            </header>

            <form onSubmit={submitForm} className="p-6 space-y-4">
              {message && <div className="rounded-xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/10 p-3 text-xs text-rose-700 dark:text-rose-400">{message}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Amount</label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Title</label>
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
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary capitalize"
                  >
                    {paymentMethods.map((p) => (
                      <option key={p} value={p}>{p.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Transaction Date</label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">Description</label>
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
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary dark:bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 dark:hover:bg-purple-700 shadow-md disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  {formLoading ? 'Saving...' : 'Save Entry'}
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