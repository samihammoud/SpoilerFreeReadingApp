import { useState, useEffect } from 'react'

import SplashScreen     from './pages/SplashScreen'
import OnboardingScreen from './pages/OnboardingScreen'
import AuthScreen       from './pages/AuthScreen'
import HomeScreen       from './pages/HomeScreen'
import ForumScreen      from './pages/ForumScreen'
import ProgressModal    from './components/ProgressModal'
import SettingsDrawer   from './components/SettingsDrawer'

/**
 * App manages:
 *   - Screen routing  (splash → onboarding → auth → home → forum)
 *   - Auth state      (user object)
 *   - Reading progress per book
 *   - Pinned book IDs
 *   - Settings drawer visibility
 *   - Progress modal (shared between Home and Forum)
 *
 * All business logic that belongs to a single screen lives inside that screen's component.
 */
export default function App() {
  // ── Routing ──────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState('splash')  // splash | onboarding | auth | home | forum

  // ── Onboarding ───────────────────────────────────────────────────────────
  const [obStep, setObStep] = useState(0)

  // ── Auth ─────────────────────────────────────────────────────────────────
  const [user,     setUser]     = useState(null)
  const [authMode, setAuthMode] = useState('login')   // 'login' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // ── Book state ────────────────────────────────────────────────────────────
  const [selectedBook,  setSelectedBook]  = useState(null)
  const [userProgress,  setUserProgress]  = useState({})   // { [bookId]: chapterNumber }
  const [pinnedIds,     setPinnedIds]     = useState(new Set())

  // ── UI overlays ───────────────────────────────────────────────────────────
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [tempProgress,      setTempProgress]      = useState(1)
  const [showSettings,      setShowSettings]      = useState(false)

  // ── Splash auto-advance ───────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'splash') return
    const t = setTimeout(() => setScreen('onboarding'), 2400)
    return () => clearTimeout(t)
  }, [screen])

  // ── Handlers: auth ────────────────────────────────────────────────────────
  const handleAuthSubmit = () => {
    setAuthError('')
    if (!email.trim() || !password.trim()) { setAuthError('Please fill in all fields.'); return }
    if (authMode === 'signup' && !name.trim()) { setAuthError('Please enter your name.'); return }

    setAuthLoading(true)
    // Simulated async login — swap this for a real API call
    setTimeout(() => {
      setAuthLoading(false)
      setUser({ name: authMode === 'signup' ? name : email.split('@')[0], email })
      setScreen('home')
    }, 900)
  }

  const handleSocialLogin = (provider) => {
    const mockUser = {
      google: { name: 'Google Reader', email: 'reader@gmail.com'   },
      apple:  { name: 'Apple Reader',  email: 'reader@icloud.com'  },
    }
    setUser(mockUser[provider])
    setScreen('home')
  }

  const handleLogout = () => {
    setUser(null)
    setShowSettings(false)
    setScreen('auth')
    // Reset all user-specific state
    setEmail(''); setPassword(''); setName(''); setAuthError('')
    setSelectedBook(null); setUserProgress({}); setPinnedIds(new Set())
  }

  const handleToggleAuthMode = () => {
    setAuthMode(m => m === 'login' ? 'signup' : 'login')
    setAuthError('')
  }

  // ── Handlers: books ───────────────────────────────────────────────────────
  const handleOpenBook = (book) => {
    setSelectedBook(book)
    if (!userProgress[book.id]) {
      setTempProgress(Math.floor(book.chapters / 4))
      setShowProgressModal(true)
    } else {
      setScreen('forum')
    }
  }

  const handleConfirmProgress = () => {
    setUserProgress(prev => ({ ...prev, [selectedBook.id]: tempProgress }))
    setShowProgressModal(false)
    setScreen('forum')
  }

  const handleTogglePin = (e, bookId) => {
    e.stopPropagation()
    setPinnedIds(prev => {
      const next = new Set(prev)
      next.has(bookId) ? next.delete(bookId) : next.add(bookId)
      return next
    })
  }

  const handleOpenProgressUpdate = () => {
    setTempProgress(userProgress[selectedBook.id] ?? 1)
    setShowProgressModal(true)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {screen === 'splash' && <SplashScreen />}

      {screen === 'onboarding' && (
        <OnboardingScreen
          step={obStep}
          onNext={()    => setObStep(s => s + 1)}
          onSkip={()    => setScreen('auth')}
          onFinish={()  => setScreen('auth')}
        />
      )}

      {screen === 'auth' && (
        <AuthScreen
          mode={authMode}
          email={email}
          password={password}
          name={name}
          error={authError}
          loading={authLoading}
          onChangeMode={handleToggleAuthMode}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onChangeName={setName}
          onSubmit={handleAuthSubmit}
          onSocialLogin={handleSocialLogin}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          user={user}
          userProgress={userProgress}
          pinnedIds={pinnedIds}
          onOpenBook={handleOpenBook}
          onTogglePin={handleTogglePin}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {screen === 'forum' && selectedBook && (
        <ForumScreen
          book={selectedBook}
          progress={userProgress[selectedBook.id] ?? 0}
          onBack={() => setScreen('home')}
          onOpenSettings={() => setShowSettings(true)}
          onUpdateProgress={handleOpenProgressUpdate}
        />
      )}

      {/* ── Shared overlays ─────────────────────────────────────────── */}
      {showProgressModal && selectedBook && (
        <ProgressModal
          book={selectedBook}
          tempProgress={tempProgress}
          onChange={setTempProgress}
          onConfirm={handleConfirmProgress}
          onClose={userProgress[selectedBook.id] ? () => setShowProgressModal(false) : null}
        />
      )}

      {showSettings && user && (
        <SettingsDrawer
          user={user}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}
