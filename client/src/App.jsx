import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import InsightsReports from './pages/InsightsReports'
import Profile from './pages/Profile'
import Balance from './pages/Balance'

// Layout
import Layout from './components/layout/Layout'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { refreshUser } from './redux/slices/authSlice'

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App