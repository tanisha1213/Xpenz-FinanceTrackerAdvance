import { Link, useLocation } from 'react-router-dom'
import { FiLayout, FiDollarSign, FiPieChart, FiTrendingUp, FiUser, FiCreditCard } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'

function BottomNavigation() {
  const location = useLocation()
  const { t } = useLanguage()
  
  const navItems = [
    { labelKey: 'dashboard', path: '/dashboard', icon: FiLayout },
    { labelKey: 'accounts', path: '/balance', icon: FiCreditCard },
    { labelKey: 'transactions', path: '/transactions', icon: FiDollarSign },
    { labelKey: 'budget', path: '/budget', icon: FiPieChart },
    { labelKey: 'analytics', path: '/insights', icon: FiTrendingUp },
    { labelKey: 'profile', path: '/profile', icon: FiUser }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav id="bottom-navigation-tour" className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/90 dark:bg-dark-card/90 border-t border-slate-100 dark:border-dark-border backdrop-blur-lg shadow-premium pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full relative transition-all duration-200 ${
                active 
                  ? 'text-secondary dark:text-purple-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-[22px] h-[22px] min-[480px]:w-5 min-[480px]:h-5 transition-all" />
              <span className="hidden min-[480px]:inline text-[9px] font-bold tracking-tight mt-0.5 whitespace-nowrap">
                {t(item.labelKey)}
              </span>
              {active && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-secondary dark:bg-purple-400 animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
