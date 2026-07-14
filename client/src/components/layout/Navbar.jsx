import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FiBell, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../common/Logo'
import { getLoans } from '../../services/loanService'
import { useLanguage } from '../../context/LanguageContext'

function Navbar() {
  const { user } = useSelector(state => state.auth)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to Xpenz', message: 'Smart AI spending forecasts and budget trackers are active.', time: 'Just now' },
    { id: 2, title: 'Budget Setup Complete', message: 'You have utilized 18% of your housing category limit.', time: '2 hours ago' }
  ])

  useEffect(() => {
    if (!user) return

    const loadReminders = async () => {
      try {
        const res = await getLoans()
        const activeLoans = res.data.data.filter(l => l.status === 'active')
        
        const reminders = activeLoans.map((loan, idx) => {
          if (!loan.nextDueDate) return null
          
          const diffTime = new Date(loan.nextDueDate) - new Date()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          let title = ''
          let message = ''
          let notify = false

          if (diffDays < 0) {
            if (loan.reminderDailyOverdue !== false) {
              title = 'EMI Overdue! 🟥'
              message = `Your EMI of ₹${loan.emiAmount.toLocaleString()} for "${loan.title}" was due on ${new Date(loan.nextDueDate).toLocaleDateString('en-IN', { timeZone: 'UTC' })}. Overdue by ${Math.abs(diffDays)} days.`
              notify = true
            }
          } else if (diffDays === 0) {
            if (loan.reminderDueDate !== false) {
              title = 'EMI Due Today ⏰'
              message = `Your EMI of ₹${loan.emiAmount.toLocaleString()} for "${loan.title}" is due today.`
              notify = true
            }
          } else if (diffDays === 1) {
            if (loan.reminder1Day !== false) {
              title = 'EMI Due Tomorrow ⏰'
              message = `Your EMI of ₹${loan.emiAmount.toLocaleString()} for "${loan.title}" is due tomorrow.`
              notify = true
            }
          } else if (diffDays > 1 && diffDays <= 3) {
            if (loan.reminder3Days !== false) {
              title = 'EMI Due in 3 Days 📅'
              message = `Your EMI of ₹${loan.emiAmount.toLocaleString()} for "${loan.title}" is due in ${diffDays} days.`
              notify = true
            }
          } else if (diffDays > 3 && diffDays <= 7) {
            if (loan.reminder7Days !== false) {
              title = 'EMI Due in 7 Days 📅'
              message = `Your EMI of ₹${loan.emiAmount.toLocaleString()} for "${loan.title}" is due in ${diffDays} days.`
              notify = true
            }
          }

          if (!notify) return null

          return {
            id: `loan-${loan._id}-${idx}-${diffDays}`,
            title,
            message,
            time: diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `${diffDays}d left`
          }
        }).filter(Boolean)

        if (reminders.length > 0) {
          setNotifications(prev => {
            const filteredPrev = prev.filter(n => !n.id.toString().startsWith('loan-'))
            return [...reminders, ...filteredPrev]
          })
          setHasUnread(true)
        }
      } catch (err) {
        console.error('Failed to load loan reminders:', err)
      }
    }

    loadReminders()
  }, [user])

  return (
    <nav className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border sticky top-0 z-30 transition-colors duration-200">
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Logo className="w-6 h-6 rounded-md" />
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Xpenz
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Language Switcher */}
          <div id="language-switcher-tour" className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-dark-border text-slate-650 dark:text-slate-300 rounded-xl pl-3 pr-7 py-1.5 text-xs font-bold focus:outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-sans"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setHasUnread(false)
              }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            >
              <FiBell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8B5CF6] rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#131522] border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-fadeIn text-slate-800 dark:text-slate-100">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-dark-border">
                  <h4 className="font-bold text-sm">Notifications</h4>
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.length ? notifications.map((n) => (
                    <div key={n.id} className="text-xs p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                      </div>
                      <p className="text-slate-500 dark:text-dark-text-muted mt-1 leading-normal font-medium">{n.message}</p>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-100 dark:border-dark-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-400 dark:text-dark-text-muted">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 dark:bg-purple-950/20 dark:border-purple-900/30 flex items-center justify-center text-secondary dark:text-purple-400 font-bold text-base shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar