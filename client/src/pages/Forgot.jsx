import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../services/authService'
import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiKey, FiCopy, FiCheck, FiArrowLeft, FiAlertCircle } from 'react-icons/fi'
import logoLight from '../assets/logo-light.png'
import logoDark from '../assets/logo-dark.png'

function Forgot() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [resetUrl, setResetUrl] = useState('')
  const [copied, setCopied] = useState(false)
  
  const { theme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResetUrl('')
    setCopied(false)

    if (!email) {
      return setError('Email is required')
    }

    setLoading(true)
    try {
      const response = await forgotPassword({ email })
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl)
        setShowPopup(true)
      } else {
        setError('Failed to generate reset link')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-bg dark:to-dark-card flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl shadow-xl p-8 w-full max-w-md relative overflow-hidden">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-indigo-650 dark:from-purple-650 dark:to-pink-650"></div>

        <div className="flex flex-col items-center mb-8">
          <img src={theme === 'light' ? logoLight : logoDark} alt="Xpenz Logo" className="w-16 h-16 rounded-2xl object-contain shadow-lg mb-3" />
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Forgot Password</h1>
          <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1 uppercase font-bold tracking-wider">AI Personal Finance</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm font-semibold"
          >
            <FiAlertCircle className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-slate-500 dark:text-dark-text-muted leading-relaxed">
            Enter your email below to request a password reset. A pop-up notification will appear inside the app to let you reset your credentials instantly.
          </p>
          
          <div className="space-y-1">
            <label className="block text-slate-750 dark:text-dark-text-muted font-bold text-xs uppercase mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-dark-text-muted">
                <FiMail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. test@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 focus:outline-none focus:border-secondary transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary dark:bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-750 dark:hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md shadow-secondary/15 dark:shadow-purple-600/10 mt-6 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <FiKey className="w-4 h-4" />
                <span>Request Password Reset</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-dark-text-muted flex items-center justify-center gap-1.5">
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Back to</span>
          <Link to="/login" className="text-secondary dark:text-purple-400 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* Stunning Popup Modal Notification */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowPopup(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 flex flex-col items-center text-center space-y-4"
            >
              {/* Glowing Icon */}
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-purple-950/20 text-secondary dark:text-purple-400 flex items-center justify-center text-2xl shadow-inner mb-2 animate-bounce">
                <FiKey />
              </div>

              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                Password Reset Generated!
              </h2>

              <p className="text-sm text-slate-500 dark:text-dark-text-muted leading-relaxed px-2">
                A password reset request for <strong className="text-slate-800 dark:text-white">{email}</strong> was processed. You can update your password instantly.
              </p>

              {/* Copy URL Section */}
              <div className="w-full bg-slate-50 dark:bg-dark-bg p-3.5 rounded-xl border border-slate-100 dark:border-dark-border flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider text-left">
                  Reset Link
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={resetUrl}
                    className="flex-1 bg-transparent text-xs font-mono text-slate-650 dark:text-slate-300 outline-none truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-white dark:bg-dark-card rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-all cursor-pointer relative"
                    title="Copy Link"
                  >
                    {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Reset Password Button */}
              <button
                onClick={() => {
                  const path = resetUrl.replace(/https?:\/\/[^\/]+/, '') // extract pathname `/reset-password/:token`
                  navigate(path)
                }}
                className="w-full bg-gradient-to-r from-secondary to-indigo-650 dark:from-purple-650 dark:to-indigo-650 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Reset Password Now</span>
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                Close Notification
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Forgot
