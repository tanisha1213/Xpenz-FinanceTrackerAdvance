import { useEffect, useMemo, useState } from 'react'
import {
  getInsurances,
  addInsurance,
  updateInsurance,
  deleteInsurance
} from '../services/insuranceService'
import { formatCurrency, formatDate } from '../utils/format'
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiShield, FiCalendar, FiUser, FiFileText
} from 'react-icons/fi'
import { useLanguage } from '../context/LanguageContext'

const INSURANCE_TYPES = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'motor', label: 'Motor (Car/Bike)' },
  { value: 'home', label: 'Home Insurance' },
  { value: 'travel', label: 'Travel Insurance' },
  { value: 'other', label: 'Other Insurance' }
]

const FREQUENCIES = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half-Yearly' },
  { value: 'one_time', label: 'One-Time' }
]

const INSURANCE_COMPANY_SUGGESTIONS = [
  'Life Insurance Corporation of India (LIC)',
  'HDFC Life Insurance',
  'SBI Life Insurance',
  'ICICI Prudential Life Insurance',
  'Max Life Insurance',
  'Star Health & Allied Insurance',
  'HDFC ERGO General Insurance',
  'ICICI Lombard General Insurance',
  'Care Health Insurance (Religare)',
  'Niva Bupa Health Insurance',
  'Bajaj Allianz General Insurance',
  'Tata AIG General Insurance',
  'SBI General Insurance',
  'New India Assurance',
  'United India Insurance'
]

const POLICY_NAME_SUGGESTIONS_BY_TYPE = {
  health: [
    'Family Optima Health Plan',
    'Optima Secure Health Plan',
    'Star Family Health Optima',
    'Care Supreme Health Cover',
    'ReAssure 2.0 Health Plan',
    'Activ Health Platinum Plan',
    'Corona Kavach Policy',
    'Arogya Sanjeevani Policy'
  ],
  life: [
    'LIC Tech Term Plan',
    'LIC Jeevan Umang',
    'HDFC Life Click 2 Protect',
    'SBI Life eShield Next',
    'ICICI Pru iProtect Smart',
    'Max Life Smart Secure Plus'
  ],
  motor: [
    'Two Wheeler Package Policy',
    'Private Car Comprehensive Plan',
    'Third Party Motor Liability Cover',
    'Zero Depreciation Motor Policy'
  ],
  home: [
    'Home Secure Policy',
    'Bharat Griha Raksha Shield',
    'Comprehensive Home Protection Cover'
  ],
  travel: [
    'International Travel Insurance Plan',
    'Student Travel Secure Cover',
    'Schengen Travel Medical Plan'
  ]
}

export default function Insurance() {
  const { language } = useLanguage()
  const [insurances, setInsurances] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showInsurerSuggestions, setShowInsurerSuggestions] = useState(false)
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    type: 'health',
    insurer: '',
    policyNumber: '',
    title: '',
    coverageAmount: '',
    premiumAmount: '',
    paymentFrequency: 'yearly',
    renewalDate: '',
    nominee: '',
    policyDocumentUrl: '',
    status: 'active'
  })

  const filteredInsurers = useMemo(() => {
    const list = INSURANCE_COMPANY_SUGGESTIONS
    if (!formData.insurer) return list
    return list.filter(item => item.toLowerCase().includes(formData.insurer.toLowerCase()))
  }, [formData.insurer])

  const currentTitles = useMemo(() => {
    const list = POLICY_NAME_SUGGESTIONS_BY_TYPE[formData.type] || []
    if (!formData.title) return list
    return list.filter(item => item.toLowerCase().includes(formData.title.toLowerCase()))
  }, [formData.type, formData.title])

  const fetchInsurances = async () => {
    try {
      setLoading(true)
      const res = await getInsurances()
      if (res.data?.success) {
        setInsurances(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load insurances:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsurances()
  }, [])

  // Calculations
  const stats = useMemo(() => {
    let totalPremiumYearly = 0
    let activePolicies = 0

    insurances.forEach((ins) => {
      if (ins.status === 'active') {
        activePolicies++
        const premium = Number(ins.premiumAmount || 0)
        // Normalize premium to yearly for stats comparison
        if (ins.paymentFrequency === 'monthly') {
          totalPremiumYearly += premium * 12
        } else if (ins.paymentFrequency === 'quarterly') {
          totalPremiumYearly += premium * 4
        } else if (ins.paymentFrequency === 'half_yearly') {
          totalPremiumYearly += premium * 2
        } else {
          // yearly or one_time (amortized)
          totalPremiumYearly += premium
        }
      }
    });

    return {
      activePolicies,
      totalPremiumYearly
    }
  }, [insurances])

  const filteredInsurances = useMemo(() => {
    return insurances.filter((ins) => {
      const matchesSearch =
        ins.title.toLowerCase().includes(search.toLowerCase()) ||
        ins.insurer.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ins.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [insurances, search, statusFilter])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      type: 'health',
      insurer: '',
      policyNumber: '',
      title: '',
      coverageAmount: '',
      premiumAmount: '',
      paymentFrequency: 'yearly',
      renewalDate: '',
      nominee: '',
      policyDocumentUrl: '',
      status: 'active'
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      insurer: item.insurer,
      policyNumber: item.policyNumber || '',
      title: item.title,
      coverageAmount: item.coverageAmount || '',
      premiumAmount: item.premiumAmount || '',
      paymentFrequency: item.paymentFrequency || 'yearly',
      renewalDate: item.renewalDate ? item.renewalDate.slice(0, 10) : '',
      nominee: item.nominee || '',
      policyDocumentUrl: item.policyDocumentUrl || '',
      status: item.status || 'active'
    })
    setIsOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this insurance policy?')) {
      try {
        await deleteInsurance(id)
        fetchInsurances()
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataPayload = {
        ...formData,
        coverageAmount: Number(formData.coverageAmount || 0),
        premiumAmount: Number(formData.premiumAmount || 0),
        renewalDate: new Date(formData.renewalDate).toISOString()
      }

      if (editingItem) {
        await updateInsurance(editingItem._id, dataPayload)
      } else {
        await addInsurance(dataPayload)
      }
      setIsOpen(false)
      fetchInsurances()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 relative w-full max-w-full overflow-hidden">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Insurance</h2>
          <p className="text-slate-400 dark:text-dark-text-muted text-sm mt-0.5">Manage health, life, and motor policies, premium commitments, and documents.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary dark:bg-purple-650 px-4 py-2.5 font-bold text-white text-sm hover:bg-indigo-700 dark:hover:bg-purple-750 shadow-md transition-all w-fit cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          Add Insurance
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Active Policies</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.activePolicies} Active</p>
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Est. Annualized Premium</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{formatCurrency(stats.totalPremiumYearly)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-3.5 rounded-2xl shadow-sm">
        <div className="flex bg-slate-150/40 dark:bg-slate-900/60 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
          {['all', 'active', 'inactive', 'expired'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                statusFilter === st
                  ? 'bg-secondary dark:bg-purple-650 text-white shadow-sm'
                  : 'text-slate-500 dark:text-dark-text hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-60">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search company or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FiRefreshCw className="w-8 h-8 text-secondary dark:text-purple-400 animate-spin" />
          <p className="text-slate-400 text-sm mt-3">Loading policies...</p>
        </div>
      ) : filteredInsurances.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl">
          <FiShield className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-200 mt-4">No Policies Logged</h3>
          <p className="text-slate-400 dark:text-dark-text-muted text-xs mt-1 max-w-xs mx-auto">Click "Add Insurance" to record your coverage limits and premium dates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInsurances.map((ins) => {
            const typeLabel = INSURANCE_TYPES.find((t) => t.value === ins.type)?.label || ins.type
            const freqLabel = FREQUENCIES.find((f) => f.value === ins.paymentFrequency)?.label || ins.paymentFrequency
            const isRenewalSoon = new Date(ins.renewalDate) - new Date() < 15 * 24 * 60 * 60 * 1000 // 15 days

            return (
              <div
                key={ins._id}
                className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Top Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base truncate">{ins.title}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold tracking-wider uppercase mt-0.5">{ins.insurer}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(ins)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-secondary dark:hover:text-purple-400 rounded-xl transition-all cursor-pointer"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ins._id)}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-full text-[9px] font-extrabold uppercase">
                      {typeLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      ins.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : ins.status === 'expired'
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-slate-400/10 text-slate-500'
                    }`}>
                      {ins.status}
                    </span>
                  </div>

                  <hr className="border-slate-100 dark:border-dark-border/40" />

                  {/* Body Metrics */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-left">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coverage Amount</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 mt-0.5">{formatCurrency(ins.coverageAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Cost</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 mt-0.5">
                        {formatCurrency(ins.premiumAmount)}/{freqLabel.toLowerCase()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold">Next Renewal:</span>
                        <span className={`font-black ${isRenewalSoon && ins.status === 'active' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'}`}>
                          {formatDate(ins.renewalDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Details: Nominee or Policy Doc */}
                {(ins.nominee || ins.policyDocumentUrl) && (
                  <div className="px-5 pb-5 pt-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 dark:border-dark-border/20 pt-4">
                    {ins.nominee && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-dark-text-muted font-bold">
                        <FiUser className="w-3.5 h-3.5 text-slate-400" />
                        <span>Nominee: {ins.nominee}</span>
                      </div>
                    )}
                    {ins.policyDocumentUrl && (
                      <a
                        href={ins.policyDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[10px] text-secondary dark:text-purple-400 font-extrabold hover:underline"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-[#131522] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-dark-border/40 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                {editingItem ? 'Edit Insurance' : 'Add Insurance'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer font-bold">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              {/* Type Select */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insurance Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  >
                    {INSURANCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insurer Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LIC, Star Health"
                    value={formData.insurer}
                    onChange={(e) => setFormData({ ...formData, insurer: e.target.value })}
                    onFocus={() => setShowInsurerSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowInsurerSuggestions(false), 200)}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                  {showInsurerSuggestions && filteredInsurers.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#131522] border border-slate-200 dark:border-dark-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-20">
                      {filteredInsurers.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, insurer: s })
                            setShowInsurerSuggestions(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Policy Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy Title / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Family Health Plan, Bike Insurance"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onFocus={() => setShowTitleSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                  {showTitleSuggestions && currentTitles.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#131522] border border-slate-200 dark:border-dark-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-20">
                      {currentTitles.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, title: s })
                            setShowTitleSuggestions(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy Number</label>
                  <input
                    type="text"
                    placeholder="e.g. POL1234567"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Coverage & Premium Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Coverage / Sum Assured</label>
                  <input
                    type="number"
                    required
                    placeholder="₹ Coverage"
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Premium Cost</label>
                  <input
                    type="number"
                    required
                    placeholder="₹ Premium"
                    value={formData.premiumAmount}
                    onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Frequency & Renewal Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Premium Frequency</label>
                  <select
                    value={formData.paymentFrequency}
                    onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Renewal / Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Nominee & Policy URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nominee</label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse, Parent"
                    value={formData.nominee}
                    onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Policy PDF Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.policyDocumentUrl}
                    onChange={(e) => setFormData({ ...formData, policyDocumentUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Buttons */}
              <button
                type="submit"
                className="w-full py-3 bg-secondary dark:bg-purple-650 hover:bg-indigo-700 dark:hover:bg-purple-750 text-white rounded-xl font-bold text-sm shadow-md transition-all mt-4 cursor-pointer text-center"
              >
                {editingItem ? 'Save Changes' : 'Confirm & Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
