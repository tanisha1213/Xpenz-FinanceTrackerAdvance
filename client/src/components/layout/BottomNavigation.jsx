import { Link, useLocation } from 'react-router-dom'
import { FiLayout, FiDollarSign, FiPieChart, FiTrendingUp, FiUser, FiCreditCard } from 'react-icons/fi'

function BottomNavigation() {
  const location = useLocation()
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: FiLayout },
    { label: 'Accounts', path: '/balance', icon: FiCreditCard },
    { label: 'Transactions', path: '/transactions', icon: FiDollarSign },
    { label: 'Budget', path: '/budget', icon: FiPieChart },
    { label: 'Analytics', path: '/insights', icon: FiTrendingUp },
    { label: 'Profile', path: '/profile', icon: FiUser }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/90 dark:bg-dark-card/90 border-t border-slate-100 dark:border-dark-border backdrop-blur-lg shadow-premium pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                active 
                  ? 'text-secondary dark:text-purple-400 font-extrabold scale-105' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
