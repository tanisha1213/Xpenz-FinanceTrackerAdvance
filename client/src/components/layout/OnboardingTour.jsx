import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { FiChevronRight, FiChevronLeft, FiX, FiHelpCircle } from 'react-icons/fi'

const tourTranslations = {
  en: {
    welcomeTitle: 'Welcome to Xpenz!',
    welcomeDesc: 'Let\'s take a quick 1-minute tour of your new AI-powered Personal Finance Dashboard.',
    langTitle: 'Native Languages',
    langDesc: 'Switch to your local language here at any time. We support English, Hindi, Marathi, and Tamil.',
    navTitle: 'Simple Navigation',
    navDesc: 'Easily switch pages to view accounts, log transactions, configure budgets, or inspect AI reports.',
    addTxTitle: 'Quick Add Transaction',
    addTxDesc: 'Click here to add your daily expenses, monthly salary, or bank loan disbursements.',
    loansTitle: 'Liabilities & Receivables',
    loansDesc: 'Monitor active borrowed bank loans or lent personal debts with real-time due dates.',
    next: 'Next',
    back: 'Back',
    skip: 'Skip Tour',
    finish: 'Finish',
    restartTour: 'Restart Tour'
  },
  hi: {
    welcomeTitle: 'एक्सपेंज (Xpenz) में आपका स्वागत है!',
    welcomeDesc: 'आइए आपके नए एआई-संचालित व्यक्तिगत वित्त डैशबोर्ड का 1 मिनट का त्वरित दौरा करें।',
    langTitle: 'स्थानीय भाषाएं',
    langDesc: 'यहां कभी भी अपनी स्थानीय भाषा बदलें। हम अंग्रेजी, हिंदी, मराठी और तमिल का समर्थन करते हैं।',
    navTitle: 'आसान नेविगेशन',
    navDesc: 'खाते देखने, लेनदेन दर्ज करने, बजट सेट करने या एआई रिपोर्ट देखने के लिए पेजों को बदलें।',
    addTxTitle: 'त्वरित लेनदेन जोड़ें',
    addTxDesc: 'अपनी आय, दैनिक खर्च या बैंक ऋण दर्ज करने के लिए यहां क्लिक करें।',
    loansTitle: 'ऋण और उधार',
    loansDesc: 'सक्रिय ऋणों और उधारों की अंतिम देय तारीखों को लाइव ट्रैक करें।',
    next: 'अगला',
    back: 'पीछे',
    skip: 'छोड़ें',
    finish: 'समाप्त',
    restartTour: 'दौरा फिर से शुरू करें'
  },
  mr: {
    welcomeTitle: 'एक्सपेंज (Xpenz) मध्ये आपले स्वागत आहे!',
    welcomeDesc: 'चला तुमच्या नवीन एआय-संचलित वैयक्तिक वित्त डॅशबोर्डची १ मिनिटाची जलद सफर करूया.',
    langTitle: 'स्थानिक भाषा',
    langDesc: 'येथे कधीही तुमची स्थानिक भाषा बदला. आम्ही इंग्रजी, हिंदी, मराठी आणि तमिळ भाषेला समर्थन देतो.',
    navTitle: 'सुलभ नेव्हिगेशन',
    navDesc: 'खाते पाहणे, व्यवहार नोंदवणे, बजेट सेट करणे किंवा एआई अहवाल पाहण्यासाठी सहजपणे पेजेस बदला.',
    addTxTitle: 'व्यवहार जोडा',
    addTxDesc: 'तुमचे उत्पन्न, दररोजचा खर्च किंवा बँकेचे कर्ज नोंदवण्यासाठी येथे क्लिक करा.',
    loansTitle: 'कर्ज आणि येणे बाकी',
    loansDesc: 'सक्रिय कर्ज आणि इतरांकडून येणारे पैसे यांचे ट्रॅकिंग मुदतीच्या तारखेसह येथे करा.',
    next: 'पुढे',
    back: 'मागे',
    skip: 'वगळा',
    finish: 'पूर्ण',
    restartTour: 'दौरा पुन्हा सुरू करा'
  },
  ta: {
    welcomeTitle: 'Xpenz-க்கு உங்களை வரவேற்கிறோம்!',
    welcomeDesc: 'உங்கள் புதிய AI நிதி டாஷ்போர்டின் 1 நிமிட விரைவான சுற்றுப்பயணத்தை மேற்கொள்வோம்.',
    langTitle: 'உள்ளூர் மொழிகள்',
    langDesc: 'இங்கே எந்த நேரத்திலும் உங்கள் உள்ளூர் மொழிக்கு மாறலாம். நாங்கள் ஆங்கிலம், இந்தி, மராத்தி மற்றும் தமிழ் ஆதரிக்கிறோம்.',
    navTitle: 'எளிதான வழிசெலுத்தல்',
    navDesc: 'கணக்குகளைப் பார்க்க, பரிவர்த்தனைகளைப் பதிவு செய்ய அல்லது பட்ஜெட்டை உள்ளமைக்க பக்கங்களை மாற்றவும்.',
    addTxTitle: 'பரிவர்த்தனை சேர்க்க',
    addTxDesc: 'உங்கள் வருமானம், தினசரி செலவு அல்லது கடன்களைப் பதிவு செய்ய இங்கே கிளிக் செய்யவும்.',
    loansTitle: 'கடன்கள் & வசூலிப்புகள்',
    loansDesc: 'பணம் செலுத்த வேண்டிய நாட்கள் மற்றும் கடன்களின் நிலைமைகளை இங்கே கண்காணிக்கவும்.',
    next: 'அடுத்து',
    back: 'முந்தைய',
    skip: 'தவிர்',
    finish: 'முடி',
    restartTour: 'சுற்றுப்பயணத்தை மீண்டும் தொடங்கு'
  }
}

const steps = [
  {
    target: null, // Center
    titleKey: 'welcomeTitle',
    descKey: 'welcomeDesc'
  },
  {
    target: '#language-switcher-tour',
    titleKey: 'langTitle',
    descKey: 'langDesc'
  },
  {
    target: '#sidebar-navigation-tour',
    titleKey: 'navTitle',
    descKey: 'navDesc'
  },
  {
    target: '#add-transaction-btn-tour',
    titleKey: 'addTxTitle',
    descKey: 'addTxDesc'
  },
  {
    target: '#active-loans-sidebar-tour',
    titleKey: 'loansTitle',
    descKey: 'loansDesc'
  }
]

export default function OnboardingTour() {
  const { language } = useLanguage()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [coords, setCoords] = useState(null)
  
  const strings = tourTranslations[language] || tourTranslations['en']

  useEffect(() => {
    const completed = localStorage.getItem('xpenz_onboarding_completed')
    if (!completed) {
      // Delay slightly to allow layout calculations
      const timer = setTimeout(() => {
        setActive(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    
    const calculatePosition = () => {
      const step = steps[stepIndex]
      if (!step.target) {
        setCoords(null)
        return
      }
      
      const el = document.querySelector(step.target)
      if (el) {
        const rect = el.getBoundingClientRect()
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom + window.scrollY
        })
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setCoords(null)
      }
    }

    calculatePosition()
    window.addEventListener('resize', calculatePosition)
    return () => window.removeEventListener('resize', calculatePosition)
  }, [stepIndex, active])

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('xpenz_onboarding_completed', 'true')
    setActive(false)
    setStepIndex(0)
  }

  const triggerRestart = () => {
    setStepIndex(0)
    setActive(true)
  }

  if (!active) {
    // Show a floating help button at bottom right to trigger tour manually
    return (
      <button
        onClick={triggerRestart}
        className="fixed bottom-20 right-6 z-40 bg-indigo-600 dark:bg-purple-650 hover:bg-indigo-750 dark:hover:bg-purple-750 text-white p-3 rounded-full shadow-lg flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer hover:scale-105 transition-all"
        title={strings.restartTour}
      >
        <FiHelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">{strings.restartTour}</span>
      </button>
    )
  }

  const currentStep = steps[stepIndex]
  const cardStyle = coords 
    ? {
        position: 'absolute',
        top: coords.bottom + 12 + 'px',
        left: Math.max(16, Math.min(window.innerWidth - 340, coords.left - 100)) + 'px',
        zIndex: 1000
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }

  // Draw viewport dimensions
  const viewW = window.innerWidth
  const viewH = Math.max(document.documentElement.scrollHeight, window.innerHeight)

  return (
    <>
      {/* Dark overlay with SVG cutout hole spotlight */}
      <svg
        className="fixed inset-0 pointer-events-auto z-[990] transition-all duration-300"
        style={{ width: '100%', height: '100%' }}
      >
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          {coords && (
            <rect
              x={coords.left - 6}
              y={coords.top - 6}
              width={coords.width + 12}
              height={coords.height + 12}
              rx="12"
              ry="12"
              fill="black"
            />
          )}
        </mask>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Tour Dialog Pop-up */}
      <div
        style={cardStyle}
        className="w-[320px] sm:w-[350px] bg-white dark:bg-[#131522] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp z-[1000] text-slate-850 dark:text-slate-100"
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-indigo-500 dark:text-purple-400 bg-indigo-50 dark:bg-purple-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {stepIndex + 1} / {steps.length}
          </span>
          <button
            onClick={handleComplete}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
            {strings[currentStep.titleKey]}
          </h4>
          <p className="text-slate-500 dark:text-dark-text-muted text-xs leading-relaxed">
            {strings[currentStep.descKey]}
          </p>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-dark-border">
          <button
            onClick={handleComplete}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold hover:underline cursor-pointer"
          >
            {strings.skip}
          </button>
          
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
                {strings.back}
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-secondary dark:bg-purple-650 hover:bg-indigo-700 dark:hover:bg-purple-750 text-white rounded-xl text-xs font-bold shadow-md shadow-secondary/15 transition-colors cursor-pointer"
            >
              {stepIndex === steps.length - 1 ? strings.finish : strings.next}
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
