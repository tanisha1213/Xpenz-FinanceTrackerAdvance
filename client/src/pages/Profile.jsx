import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, updateProfileThunk } from '../redux/slices/authSlice'
import { changePassword, getAccountStats } from '../services/authService'
import { formatCurrency } from '../utils/format'
import { FiUser, FiKey, FiCheck, FiPieChart, FiLogOut } from 'react-icons/fi'
import { useLanguage } from '../context/LanguageContext'

function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useSelector(state => state.auth)
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email })
    getAccountStats().then((response) => setStats(response.data.data))
  }, [user])

  const saveProfile = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await dispatch(updateProfileThunk(profile)).unwrap()
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err || 'Unable to update profile.')
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setMessage('Password changed successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">{t('profile')}</h2>
        <p className="text-slate-400 dark:text-dark-text-muted text-sm mt-0.5">{t('profileSubtitle')}</p>
      </div>

      {message && <div className="rounded-xl border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/50 dark:bg-emerald-950/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">{message}</div>}
      {error && <div className="rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/5 p-3 text-sm text-rose-700 dark:text-rose-400">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium lg:col-span-2 space-y-8">
          {/* User Profile Form */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border pb-4 mb-4">
              <FiUser className="w-5 h-5 text-secondary dark:text-purple-400" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">{t('userProfile')}</h3>
            </div>
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase">{t('name')}</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase">{t('email')}</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary dark:bg-purple-650 px-4 py-2.5 font-bold text-white text-sm hover:bg-indigo-700 dark:hover:bg-purple-750 transition-colors sm:w-fit mt-2 shadow-md shadow-secondary/15 cursor-pointer">
                <FiCheck className="w-4 h-4" />
                {t('saveChanges')}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border pb-4 mb-4">
              <FiKey className="w-5 h-5 text-secondary dark:text-purple-400" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Security</h3>
            </div>
            <form onSubmit={savePassword} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase">Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase">New Password</label>
                <input
                  type="password"
                  minLength="6"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-2.5 text-sm bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary dark:bg-purple-650 px-4 py-2.5 font-bold text-white text-sm hover:bg-indigo-700 dark:hover:bg-purple-750 transition-colors sm:w-fit mt-2 shadow-md shadow-secondary/15 cursor-pointer">
                <FiKey className="w-4 h-4" />
                Change Password
              </button>
            </form>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          {/* Account statistics */}
          <section className="rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-premium h-fit space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-dark-border">
              <FiPieChart className="w-5 h-5 text-secondary dark:text-purple-400" />
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Account Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-slate-50 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Total Actions Logged</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">{stats?.transactionCount || 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-50 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Gross Income Total</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.totalIncome)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-50 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Gross Expense Total</span>
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(stats?.totalExpense)}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-50 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">Total Savings Accumulation</span>
                <span className="text-xl font-extrabold text-indigo-650 dark:text-purple-400">{formatCurrency(stats?.savings)}</span>
              </div>
            </div>
          </section>

          {/* Exit Session / Logout Option */}
          <section className="rounded-2xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 p-6 shadow-premium h-fit space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-rose-100 dark:border-rose-950/20">
              <FiLogOut className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-rose-800 dark:text-rose-400 text-lg">Exit Account</h3>
            </div>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/60 font-medium">Log out of your current session on this device. You will need to input your credentials again to log back in.</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-650 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-rose-600/15 cursor-pointer"
            >
              <FiLogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile