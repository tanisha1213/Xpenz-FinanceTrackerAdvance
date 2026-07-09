import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FiUser, FiBell, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'

function Navbar() {
  const { user } = useSelector(state => state.auth)
  const { theme, toggleTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to Xpenz', message: 'Smart AI spending forecasts and budget trackers are active.', time: 'Just now' },
    { id: 2, title: 'Budget Setup Complete', message: 'You have utilized 18% of your housing category limit.', time: '2 hours ago' }
  ])

  return (
    <nav className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border sticky top-0 z-30 transition-colors duration-200">
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img src={theme === 'light' ? '/logo-light.png' : '/favicon.png'} alt="Xpenz Logo" className="w-6 h-6 rounded-md object-contain shadow-sm" />
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