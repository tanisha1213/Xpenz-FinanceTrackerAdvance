import { useNotification } from '../../context/NotificationContext'
import { FiBell, FiX, FiAlertCircle, FiClock } from 'react-icons/fi'

export default function PopUpBanner() {
  const { popups, dismissPopup } = useNotification()

  if (!popups || popups.length === 0) return null

  // Show at most 2 visible toasts at a time to prevent full-screen stacking
  const visiblePopups = popups.slice(-2)

  return (
    <div className="fixed top-5 right-4 left-4 sm:left-auto sm:w-96 z-[9999] space-y-3 pointer-events-none">
      {visiblePopups.map((popup) => {
        const isOverdue = popup.type === 'overdue' || popup.title.includes('Overdue')
        const isDue = popup.type === 'due' || popup.title.includes('Due')
        
        return (
          <div
            key={popup.id}
            className="pointer-events-auto bg-white/95 dark:bg-[#131522]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl p-4 transition-all duration-300 transform translate-y-0 animate-bounce-subtle flex items-start gap-3 text-slate-800 dark:text-slate-100"
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${
              isOverdue 
                ? 'bg-rose-500/10 text-rose-500' 
                : isDue 
                  ? 'bg-amber-500/10 text-amber-500' 
                  : 'bg-indigo-500/10 text-indigo-500 dark:bg-purple-500/10 dark:text-purple-400'
            }`}>
              {isOverdue ? <FiAlertCircle className="w-5 h-5" /> : isDue ? <FiClock className="w-5 h-5" /> : <FiBell className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-extrabold text-sm truncate text-slate-900 dark:text-white">
                  {popup.title}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                  {popup.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1 leading-snug font-medium line-clamp-2">
                {popup.message}
              </p>
            </div>

            <button
              onClick={() => dismissPopup(popup.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
