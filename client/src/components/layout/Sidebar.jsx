import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { FiLayout, FiDollarSign, FiPieChart, FiTrendingUp, FiUser, FiLogOut } from 'react-icons/fi'

function Sidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: FiLayout },
    { label: 'Transactions', path: '/transactions', icon: FiDollarSign },
    { label: 'Budget', path: '/budget', icon: FiPieChart },
    { label: 'Analytics', path: '/insights', icon: FiTrendingUp },
    { label: 'Profile', path: '/profile', icon: FiUser }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 dark:bg-dark-card text-white flex flex-col transition-all duration-200 border-r border-slate-800 dark:border-dark-border shadow-premium h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 dark:border-dark-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <img src="/favicon.png" alt="Xpenz Logo" className="w-8 h-8 rounded-lg object-contain shadow-md" />
            Xpenz
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1 font-bold uppercase tracking-wider">AI Personal Finance</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 bg-slate-900 dark:bg-dark-card overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-secondary dark:bg-purple-600/20 text-white dark:text-purple-400 border-l-4 border-secondary dark:border-purple-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 dark:border-dark-border bg-slate-950/20 dark:bg-dark-card/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm"
        >
          <FiLogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar