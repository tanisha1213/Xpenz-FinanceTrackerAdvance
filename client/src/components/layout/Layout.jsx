import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomNavigation from './BottomNavigation'

function Layout() {
  return (
    <div className="flex h-screen bg-slate-light dark:bg-dark-bg overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Component (Visible only on desktop screens md+) */}
      <div className="hidden md:block">
        <Sidebar isOpen={false} setIsOpen={() => {}} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar Component */}
        <Navbar />
        
        {/* Extra bottom padding (pb-20) on mobile viewports prevents content from overlapping the bottom bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
        
        {/* Bottom Navigation Component (Visible only on mobile screens) */}
        <BottomNavigation />
      </div>
    </div>
  )
}

export default Layout