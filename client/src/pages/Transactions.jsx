import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTransactions,
  removeTransactionById,
  saveTransaction
} from '../redux/slices/transactionSlice'
import { categories, formatCurrency, formatDate, paymentMethods } from '../utils/format'
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiPercent, FiInfo, FiCalendar
} from 'react-icons/fi'
import { useLanguage } from '../context/LanguageContext'
import { getLoans, addLoan } from '../services/loanService'
import { getAccounts } from '../services/accountService'

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  accountId: '', // Explicit account association
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  
  // Integrated Loan properties
  isLoan: false,
  loanAction: 'link', // 'link' = repay existing loan, 'create' = create new loan
  loanId: '', // for linking existing
  loanMainCategory: 'bank', // 'bank' | 'personal'
  loanSubCategory: 'home',
  loanLenderName: '',
  loanInterestRate: '0',
  loanEmiAmount: '0',
  loanEndDate: ''
}

function Transactions() {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { transactions, pagination, loading, error } = useSelector(state => state.transactions)

  // System states
  const [loans, setLoans] = useState([])
  const [accounts, setAccounts] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'latest',
    loanId: '', // filter transactions by linked loan
    page: 1
  })

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loansLoading, setLoansLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get calendar days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const startDay = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  // Get active loans ending on a specific date
  const getLoansEndingOnDate = (day) => {
    if (!day) return []
    return loans.filter(loan => {
      if (!loan.endDate || loan.status !== 'active') return false
      const loanDate = new Date(loan.endDate)
      return (
        loanDate.getDate() === day.getDate() &&
        loanDate.getMonth() === day.getMonth() &&
        loanDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const query = useMemo(() => ({
    search: filters.search,
    type: filters.type,
    category: filters.category,
    sort: filters.sort,
    loanId: filters.loanId,
    page: filters.page,
    limit: 10
  }), [filters])

  const fetchLoansAndAccounts = async () => {
    try {
      setLoansLoading(true)
      const [loansRes, accountsRes] = await Promise.all([getLoans(), getAccounts()])
      setLoans(loansRes.data.data)
      setAccounts(accountsRes.data.data)
    } catch (err) {
      console.error('Failed to fetch support data:', err)
    } finally {
      setLoansLoading(false)
    }
  }

  useEffect(() => {
    dispatch(fetchTransactions(query))
  }, [dispatch, query])

  useEffect(() => {
    fetchLoansAndAccounts()
  }, [showForm])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1
    })
  }

  const handleSelectLoanFilter = (loanId) => {
    setFilters({
      ...filters,
      loanId: filters.loanId === loanId ? '' : loanId, // toggle filter
      page: 1
    })
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      sort: 'latest',
      loanId: '',
      page: 1
    })
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      accountId: accounts[0]?._id || ''
    })
    setShowForm(true)
    setMessage('')
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setForm({
      type: item.type,
      title: item.title,
      amount: item.amount,
      category: item.category,
      paymentMethod: item.paymentMethod,
      accountId: item.accountId?._id || item.accountId || '',
      description: item.description || '',
      transactionDate: new Date(item.transactionDate).toISOString().slice(0, 10),
      isLoan: !!item.loanId,
      loanAction: 'link',
      loanId: item.loanId?._id || item.loanId || '',
      loanMainCategory: item.loanId?.mainCategory || 'bank',
      loanSubCategory: item.loanId?.subCategory || 'home',
      loanLenderName: item.loanId?.lenderName || '',
      loanInterestRate: item.loanId?.interestRate?.toString() || '0',
      loanEmiAmount: item.loanId?.emiAmount?.toString() || '0',
      loanEndDate: item.loanId?.endDate ? new Date(item.loanId.endDate).toISOString().slice(0, 10) : ''
    })
    setShowForm(true)
    setMessage('')
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    
    let extraChanges = {}

    // Compute preview values including this input change
    const currentIsLoan = name === 'isLoan' ? !!val : !!form.isLoan
    const currentLoanAction = name === 'loanAction' ? val : form.loanAction
    const currentLoanId = name === 'loanId' ? val : form.loanId
    const currentAmount = name === 'amount' ? Number(val) : Number(form.amount)
    const currentType = name === 'type' ? val : form.type
    const currentLenderName = name === 'loanLenderName' ? val : form.loanLenderName
    const currentMainCategory = name === 'loanMainCategory' ? val : form.loanMainCategory
    const currentSubCategory = name === 'loanSubCategory' ? val : form.loanSubCategory

    if (currentIsLoan) {
      if (currentLoanAction === 'link') {
        extraChanges.category = 'Bills' // force category to Bills for repayment
        
        const loan = loans.find(l => l._id === currentLoanId)
        if (loan) {
          if (currentAmount >= loan.remainingAmount) {
            extraChanges.title = `Cleared loan of ${loan.lenderName}`
          } else {
            if (loan.type === 'borrowed') {
              extraChanges.title = `Repayment of ${loan.title} to ${loan.lenderName}`
            } else {
              extraChanges.title = `Repayment received for ${loan.title} from ${loan.lenderName}`
            }
          }
        }
      } else if (currentLoanAction === 'create') {
        extraChanges.category = 'Other' // force category to Other for creation
        
        if (currentLenderName && currentLenderName.trim() !== '') {
          const capitalizedSub = currentSubCategory.charAt(0).toUpperCase() + currentSubCategory.slice(1)
          if (currentMainCategory === 'bank') {
            extraChanges.title = `${currentLenderName.trim()} - ${capitalizedSub} Loan`
          } else {
            if (currentType === 'income') {
              extraChanges.title = `Loan from ${currentLenderName.trim()}`
            } else {
              extraChanges.title = `Loan to ${currentLenderName.trim()}`
            }
          }
        }
      }
    }

    setForm({
      ...form,
      [name]: val,
      ...extraChanges
    })
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      if (form.isLoan && form.loanAction === 'create') {
        // Step 1: Create the new loan ledger with integrated initial transaction setup
        await addLoan({
          title: form.title,
          type: form.type === 'income' ? 'borrowed' : 'lent',
          mainCategory: form.loanMainCategory,
          subCategory: form.loanSubCategory,
          lenderName: form.loanLenderName,
          totalAmount: Number(form.amount),
          interestRate: Number(form.loanInterestRate) || 0,
          emiAmount: Number(form.loanEmiAmount) || 0,
          startDate: form.transactionDate,
          endDate: form.loanEndDate || undefined,
          accountId: form.accountId || undefined
        })
        
        setShowForm(false)
        dispatch(fetchTransactions(query))
        fetchLoansAndAccounts()
        setMessage('Loan ledger created and transaction recorded successfully.')
      } else {
        // Standard save (normal transaction or linking existing loan)
        const payload = {
          ...form,
          loanId: (form.isLoan && form.loanAction === 'link') ? form.loanId : undefined
        }
        await dispatch(saveTransaction({ id: editingId, data: payload })).unwrap()
        setShowForm(false)
        dispatch(fetchTransactions(query))
        fetchLoansAndAccounts()
        setMessage(editingId ? 'Transaction updated successfully.' : 'Transaction created successfully.')
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err || 'Failed to save transaction')
    }
  }

  const deleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await dispatch(removeTransactionById(item._id)).unwrap()
        dispatch(fetchTransactions(query))
        fetchLoansAndAccounts()
        setMessage('Transaction deleted successfully.')
      } catch (err) {
        setMessage(err || 'Failed to delete transaction')
      }
    }
  }

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    })
  }

  // Amortization Category context
  const subCategoryOptions = {
    bank: [
      { value: 'home', label: 'Home Loan' },
      { value: 'car', label: 'Car Loan' },
      { value: 'education', label: 'Education Loan' },
      { value: 'personal', label: 'Personal Loan' },
      { value: 'business', label: 'Business Loan' },
      { value: 'other', label: 'Other Bank Loan' }
    ],
    personal: [
      { value: 'friend', label: 'Friend' },
      { value: 'family', label: 'Family' },
      { value: 'colleague', label: 'Colleague' },
      { value: 'other', label: 'Other Debt' }
    ]
  }

  // Active loans computations
  const activeBorrowedLoans = loans.filter(l => l.type === 'borrowed' && l.status === 'active')
  const activeLentLoans = loans.filter(l => l.type === 'lent' && l.status === 'active')

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Page Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t('transactions')}</h2>
          <p className="text-slate-400 dark:text-dark-text-muted text-sm mt-0.5">Manage details of your cash flows, repayments, and liabilities.</p>
        </div>
        <button
          id="add-transaction-btn-tour"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary dark:bg-purple-650 px-4 py-2.5 font-bold text-white text-sm hover:bg-indigo-700 dark:hover:bg-purple-750 shadow-md transition-all w-fit cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          {t('addTransaction')}
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Left Side: Transactions List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Filters Form Block */}
          <section id="transactions-filter-tour" className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-4 shadow-premium">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  name="search"
                  placeholder={t('searchPlaceholder')}
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none cursor-pointer"
              >
                <option value="">{t('allTypes')}</option>
                <option value="income">{t('income')}</option>
                <option value="expense">{t('expense')}</option>
              </select>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none cursor-pointer"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 px-3 py-2 text-sm focus:outline-none cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                {t('resetFilters')}
              </button>
            </div>
            {filters.loanId && (
              <div className="mt-3 flex items-center justify-between bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-1.5 font-semibold">
                  <FiInfo className="w-4 h-4" />
                  {t('showingOnlyLinked')} <span className="underline">{loans.find(l => l._id === filters.loanId)?.title}</span>
                </div>
                <button
                  onClick={() => setFilters({ ...filters, loanId: '' })}
                  className="font-bold hover:underline cursor-pointer"
                >
                  {t('clearLoanFilter')}
                </button>
              </div>
            )}
          </section>

          {/* Messages Banner */}
          {message && (
            <div className={`rounded-xl border p-4 text-sm ${
              message.includes('failed') || message.includes('Failed')
                ? 'border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/5 text-rose-700 dark:text-rose-400'
                : 'border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/50 dark:bg-emerald-950/5 text-emerald-700 dark:text-emerald-400'
            }`}>
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/5 p-4 text-sm text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Transactions Table Section */}
          <section id="transactions-table-tour" className="overflow-hidden rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-500 dark:text-dark-text-muted font-bold uppercase text-xs border-b border-slate-100 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4">{t('titleDesc')}</th>
                    <th className="px-6 py-4">{t('type')}</th>
                    <th className="px-6 py-4">{t('category')}</th>
                    <th className="px-6 py-4">{t('account')}</th>
                    <th className="px-6 py-4">{t('date')}</th>
                    <th className="px-6 py-4">{t('method')}</th>
                    <th className="px-6 py-4">{t('amount')}</th>
                    <th className="px-6 py-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border text-slate-700 dark:text-slate-350">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-secondary dark:border-purple-400"></div>
                          Loading entries...
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length > 0 ? (
                    transactions.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{item.title}</p>
                            {item.loanId && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-950/10">
                                  Linked: {item.loanId.title || 'Loan'}
                                </span>
                              </div>
                            )}
                            {item.description && (
                              <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-0.5 max-w-[200px] truncate">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            item.type === 'income'
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                              : item.type === 'expense'
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
                                : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{item.category}</td>
                        <td className="px-6 py-4 text-slate-550 dark:text-slate-400">
                          {item.accountId?.name || 'Cash'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(item.transactionDate)}</td>
                        <td className="px-6 py-4 font-medium text-xs text-slate-550 dark:text-slate-400 capitalize">
                          {item.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className={`px-6 py-4 font-extrabold ${
                          item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1 text-slate-400 hover:text-secondary dark:hover:text-purple-400 rounded transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item)}
                              className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-rose-450 rounded transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-dark-border px-6 py-4 text-sm bg-slate-50/50 dark:bg-dark-card text-slate-500 dark:text-dark-text-muted">
              <p className="font-medium">
                Page {pagination.page} of {pagination.pages || 1} <span className="text-slate-400 dark:text-slate-500">({pagination.total} records)</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-350 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-350 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Active Loans Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          <section id="active-loans-sidebar-tour" className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium space-y-6 h-fit">
            <div className="border-b border-slate-100 dark:border-dark-border pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">{t('activeLoans')}</h3>
              <FiPercent className="w-4.5 h-4.5 text-indigo-500 dark:text-purple-400" />
            </div>

            {loansLoading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Loading ledger...</div>
            ) : loans.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs leading-normal">
                <p>{t('noLoansFound')}</p>
                <button
                  onClick={openCreate}
                  className="mt-2 text-indigo-650 dark:text-purple-400 hover:underline font-bold cursor-pointer"
                >
                  {t('createInsideTx')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Borrowed Loans */}
                {activeBorrowedLoans.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('owedTaken')}</span>
                    {activeBorrowedLoans.map((loan) => {
                      const pct = Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100)
                      const isFiltered = filters.loanId === loan._id
                      
                      return (
                        <div
                          key={loan._id}
                          onClick={() => handleSelectLoanFilter(loan._id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isFiltered
                              ? 'border-rose-300 bg-rose-50/10 dark:border-rose-900/40 dark:bg-rose-950/5'
                              : 'border-slate-100 hover:border-slate-200 dark:border-dark-border dark:hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{loan.title}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{loan.lenderName}</span>
                          </div>
                          <div className="flex justify-between mt-2 font-extrabold text-slate-800 dark:text-white">
                            <span>{formatCurrency(loan.remainingAmount)}</span>
                            <span className="text-[10px] text-slate-400">EMI: {loan.emiAmount > 0 ? formatCurrency(loan.emiAmount) : 'N/A'}</span>
                          </div>
                          {loan.endDate && (
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-dark-text-muted font-semibold mt-1">
                              <FiCalendar className="w-3 h-3 text-indigo-500 dark:text-purple-400" />
                              <span>{t('endsOn')}: {formatDate(loan.endDate)}</span>
                            </div>
                          )}
                          <div className="w-full h-1 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Lent Loans */}
                {activeLentLoans.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('collectLent')}</span>
                    {activeLentLoans.map((loan) => {
                      const pct = Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100)
                      const isFiltered = filters.loanId === loan._id

                      return (
                        <div
                          key={loan._id}
                          onClick={() => handleSelectLoanFilter(loan._id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isFiltered
                              ? 'border-emerald-350 bg-emerald-50/10 dark:border-emerald-900/40 dark:bg-emerald-950/5'
                              : 'border-slate-100 hover:border-slate-200 dark:border-dark-border dark:hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{loan.title}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{loan.lenderName}</span>
                          </div>
                          <div className="flex justify-between mt-2 font-extrabold text-slate-800 dark:text-white">
                            <span>{formatCurrency(loan.remainingAmount)}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Repay: {loan.emiAmount > 0 ? formatCurrency(loan.emiAmount) : 'N/A'}</span>
                          </div>
                          {loan.endDate && (
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-dark-text-muted font-semibold mt-1">
                              <FiCalendar className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              <span>{t('endsOn')}: {formatDate(loan.endDate)}</span>
                            </div>
                          )}
                          <div className="w-full h-1 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Amortization Calendar Widget */}
                <div id="due-date-calendar-tour" className="border-t border-slate-100 dark:border-dark-border pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('dueDateCalendar')}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                          setCurrentMonth(prev)
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                        type="button"
                      >
                        <FiChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-355 min-w-[70px] text-center capitalize">
                        {currentMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => {
                          const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                          setCurrentMonth(next)
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                        type="button"
                      >
                        <FiChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {getDaysInMonth(currentMonth).map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} className="h-6" />

                      const loansEnding = getLoansEndingOnDate(day)
                      const hasBorrowed = loansEnding.some(l => l.type === 'borrowed')
                      const hasLent = loansEnding.some(l => l.type === 'lent')
                      
                      let bgClass = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-full'
                      let textClass = 'text-slate-700 dark:text-slate-300'
                      let titleStr = `No loans ending on this date.`
                      
                      if (loansEnding.length > 0) {
                        titleStr = `Due: ${loansEnding.map(l => `${l.title} (${l.type === 'borrowed' ? 'Owed' : 'Lent'}: ${formatCurrency(l.remainingAmount)})`).join(', ')}`
                        if (hasBorrowed && hasLent) {
                          bgClass = 'bg-indigo-500 text-white rounded-full font-black'
                          textClass = 'text-white'
                        } else if (hasBorrowed) {
                          bgClass = 'bg-rose-500 text-white rounded-full font-black shadow-sm'
                          textClass = 'text-white'
                        } else {
                          bgClass = 'bg-emerald-500 text-white rounded-full font-black shadow-sm'
                          textClass = 'text-white'
                        }
                      }

                      const isToday = new Date().toDateString() === day.toDateString()
                      const todayClass = isToday && loansEnding.length === 0 ? 'border border-indigo-500 rounded-full font-bold' : ''

                      return (
                        <div
                          key={`day-${day.getDate()}`}
                          title={titleStr}
                          onClick={() => {
                            if (loansEnding.length > 0) {
                              handleSelectLoanFilter(loansEnding[0]._id)
                            }
                          }}
                          className={`h-6 flex items-center justify-center text-[10px] font-semibold transition-all cursor-pointer ${bgClass} ${textClass} ${todayClass}`}
                        >
                          {day.getDate()}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex gap-3 justify-center text-[9px] text-slate-400 font-bold pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      {t('repayDue')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {t('collectDue')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Creation/Editing Dialog Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-dark-border max-h-[95vh] overflow-y-auto">
            <header className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-slate-50/50 dark:bg-dark-card/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingId ? t('editTransaction') : t('newTransaction')}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg cursor-pointer"
              >
                &times;
              </button>
            </header>

            <form onSubmit={submitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('typeLabel')}</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
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
                  placeholder="e.g. Monthly Salary, Grocery run"
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('accountLabel')}</label>
                  <select
                    name="accountId"
                    value={form.accountId}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('paymentMethod')}</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none capitalize cursor-pointer"
                  >
                    {paymentMethods.map((p) => (
                      <option key={p} value={p}>{p.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('category')}</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    disabled={form.isLoan}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none disabled:opacity-60 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('transactionDate')}</label>
                  <div className="relative">
                    <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      name="transactionDate"
                      value={form.transactionDate}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-dark-border pr-10 pl-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* INTEGRATED LOANS & DEBTS CONFIGURATION */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-dark-border space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isLoan"
                    id="isLoan"
                    checked={form.isLoan}
                    onChange={handleFormChange}
                    className="rounded text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isLoan" className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase cursor-pointer">
                    {t('isLoanTx')}
                  </label>
                </div>

                {form.isLoan && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-dark-border">
                    
                    {/* Loan Action selection */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('loanAction')}</label>
                      <div className="flex gap-4 mt-0.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="loanAction"
                            value="link"
                            checked={form.loanAction === 'link'}
                            onChange={handleFormChange}
                            className="text-secondary w-3.5 h-3.5 focus:ring-transparent cursor-pointer"
                          />
                          {t('repayExisting')}
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="loanAction"
                            value="create"
                            checked={form.loanAction === 'create'}
                            onChange={handleFormChange}
                            className="text-secondary w-3.5 h-3.5 focus:ring-transparent cursor-pointer"
                          />
                          {t('createNewLedger')}
                        </label>
                      </div>
                    </div>

                    {/* ACTION A: LINK EXISTING */}
                    {form.loanAction === 'link' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('selectActiveLoan')}</label>
                        {loans.length === 0 ? (
                          <span className="text-xs text-rose-500 font-semibold block mt-1">No active loan ledgers found. Please create one.</span>
                        ) : (
                          <select
                            name="loanId"
                            value={form.loanId}
                            onChange={handleFormChange}
                            className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            required
                          >
                            <option value="">-- Choose active loan --</option>
                            {loans.filter(l => l.status === 'active').map((loan) => (
                              <option key={loan._id} value={loan._id}>
                                {loan.title} ({loan.type === 'borrowed' ? 'Owed' : 'Lent'}: {formatCurrency(loan.remainingAmount)})
                              </option>
                            ))}
                          </select>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1 leading-normal">
                          * Selecting a loan will automatically log this as a repayment installment and update its remaining amount. Category is automatically set to &quot;Bills&quot;.
                        </span>
                      </div>
                    )}

                    {/* ACTION B: CREATE NEW LEDGER */}
                    {form.loanAction === 'create' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('mainOption')}</label>
                            <select
                              name="loanMainCategory"
                              value={form.loanMainCategory}
                              onChange={handleFormChange}
                              className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="bank">{t('bankLoan')}</option>
                              <option value="personal">{t('personalDebt')}</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('subOption')}</label>
                            <select
                              name="loanSubCategory"
                              value={form.loanSubCategory}
                              onChange={handleFormChange}
                              className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none capitalize cursor-pointer"
                            >
                              {subCategoryOptions[form.loanMainCategory].map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {form.loanMainCategory === 'bank' ? t('bankName') : t('personName')}
                            </label>
                            <input
                              type="text"
                              name="loanLenderName"
                              value={form.loanLenderName}
                              onChange={handleFormChange}
                              placeholder={form.loanMainCategory === 'bank' ? 'e.g. HDFC Bank' : 'e.g. Uncle John, Friend Raj'}
                              className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('endDate')}</label>
                            <div className="relative">
                              <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              <input
                                type="date"
                                name="loanEndDate"
                                value={form.loanEndDate}
                                onChange={handleFormChange}
                                className="w-full rounded-xl border border-slate-200 dark:border-dark-border pr-10 pl-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('interestRate')}</label>
                            <input
                              type="number"
                              name="loanInterestRate"
                              step="0.01"
                              value={form.loanInterestRate}
                              onChange={handleFormChange}
                              className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('emi')}</label>
                            <input
                              type="number"
                              name="loanEmiAmount"
                              value={form.loanEmiAmount}
                              onChange={handleFormChange}
                              className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/20 bg-indigo-50/50 dark:bg-indigo-950/5 p-3 text-[10px] text-indigo-700 dark:text-indigo-400 leading-normal">
                          <strong>{t('amortizationNote')}:</strong> Submitting this will create a new Loan ledger with a principal balance equal to the transaction amount (₹{form.amount || 0}).
                          <br />
                          {form.type === 'income' 
                            ? '• Since this transaction is an Inflow, it will create a borrowed loan (Liability) deposited to your account.' 
                            : '• Since this transaction is an Outflow, it will create a lent loan (Asset) withdrawn from your account.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1">{t('descriptionLabel')}</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <footer className="pt-4 border-t border-slate-100 dark:border-dark-border flex justify-end gap-3 bg-slate-50/50 dark:bg-dark-card/50 -mx-6 -mb-6 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-secondary dark:bg-purple-650 px-5 py-2.5 font-bold text-white text-sm hover:bg-indigo-700 dark:hover:bg-purple-750 transition-colors shadow-md shadow-secondary/15 cursor-pointer"
                >
                  {editingId ? t('saveChanges') : form.isLoan && form.loanAction === 'create' ? t('createLoanAndLog') : t('addTransaction')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions