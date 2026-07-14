import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'

// Lazy loaded Pages for performance
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Forgot = lazy(() => import('./pages/Forgot'))
const Reset = lazy(() => import('./pages/Reset'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Budget = lazy(() => import('./pages/Budget'))
const InsightsReports = lazy(() => import('./pages/InsightsReports'))
const Profile = lazy(() => import('./pages/Profile'))
const Balance = lazy(() => import('./pages/Balance'))

// Layout
import Layout from './components/layout/Layout'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { refreshUser } from './redux/slices/authSlice'

function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#090b11]">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-secondary dark:border-slate-800 dark:border-t-purple-400"></div>
    </div>
  )
}

function ProtectedRoute() {
  const { isAuthenticated } = useSelector(state => state.auth)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) return

    dispatch(refreshUser())
  }, [dispatch])

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password/:token" element={<Reset />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/balance" element={<Balance />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/insights" element={<InsightsReports />} />
              <Route path="/reports" element={<Navigate to="/insights" replace />} />
              <Route path="/loans" element={<Navigate to="/transactions?tab=loans" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App