import { useSelector } from 'react-redux'
import { FiUser, FiBell, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'

function Navbar() {
  const { user } = useSelector(state => state.auth)
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border sticky top-0 z-30 transition-colors duration-200">
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="Xpenz Logo" className="w-6 h-6 rounded-md object-contain shadow-sm" />
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Xpenz
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5 text-amber-400" />}
          </button>

          <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <FiBell className="w-5 h-5" />
          </button>

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