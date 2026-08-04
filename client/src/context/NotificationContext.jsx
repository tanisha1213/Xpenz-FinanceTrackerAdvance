import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [popupEnabled, setPopupEnabledState] = useState(() => {
    const saved = localStorage.getItem('xpenz_popup_notifications')
    return saved === null ? true : saved === 'true'
  })

  const [popups, setPopups] = useState([])

  const setPopupEnabled = (enabled) => {
    setPopupEnabledState(enabled)
    localStorage.setItem('xpenz_popup_notifications', enabled ? 'true' : 'false')
  }

  const dismissPopup = (id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id))
  }

  const triggerPopup = ({ id, title, message, time = 'Just now', type = 'info' }) => {
    // If pop-ups are turned off in settings, do not show floating banner
    if (!popupEnabled) return

    const popupId = id || `popup-${Date.now()}-${Math.random()}`
    
    // Check if already popped up
    setPopups((prev) => {
      if (prev.some((p) => p.id === popupId)) return prev
      return [...prev, { id: popupId, title, message, time, type }]
    })

    // Browser Notification API (if permission is granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/pwa-192x192.png'
        })
      } catch (err) {
        console.warn('Browser Notification trigger failed:', err)
      }
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissPopup(popupId)
    }, 5000)
  }

  // Request browser notification permission if popups are enabled
  useEffect(() => {
    if (popupEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [popupEnabled])

  return (
    <NotificationContext.Provider
      value={{
        popupEnabled,
        setPopupEnabled,
        popups,
        triggerPopup,
        dismissPopup
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
