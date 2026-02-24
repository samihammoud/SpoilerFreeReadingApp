/**
 * Login / Sign-up screen.
 *
 * @param {{
 *   mode:          'login' | 'signup',
 *   email:         string,
 *   password:      string,
 *   name:          string,
 *   error:         string,
 *   loading:       boolean,
 *   onChangeMode:  () => void,
 *   onChangeEmail: (v: string) => void,
 *   onChangePassword: (v: string) => void,
 *   onChangeName:  (v: string) => void,
 *   onSubmit:      () => void,
 *   onSocialLogin: (provider: string) => void,
 * }} props
 */
export default function AuthScreen({
  mode, email, password, name, error, loading,
  onChangeMode, onChangeEmail, onChangePassword, onChangeName,
  onSubmit, onSocialLogin,
}) {
  const isLogin = mode === 'login'

  return (
    <div className="fixed inset-0 bg-surface-dark flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Mini logo */}
        <div className="text-center mb-9">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[22px] mx-auto mb-3.5"
            style={{ background: 'linear-gradient(135deg,#c8a048,#7a5820)' }}
          >
            📖
          </div>
          <h1 className="font-display text-[22px] font-bold text-ink">
            Chapter<span className="text-brand-gold">&amp;</span>Verse
          </h1>
        </div>

        {/* Heading */}
        <h2 className="font-display text-[26px] font-bold text-ink mb-1.5">
          {isLogin ? 'Welcome back.' : 'Create your account.'}
        </h2>
        <p className="font-crimson text-base text-ink-subtle italic mb-7">
          {isLogin ? 'Sign in to continue your reading journey.' : 'Join thousands of readers today.'}
        </p>

        {/* Social login */}
        <div className="flex flex-col gap-2.5 mb-5">
          <button className="btn-social" onClick={() => onSocialLogin('google')}>
            <span className="text-lg">🔵</span> Continue with Google
          </button>
          <button className="btn-social" onClick={() => onSocialLogin('apple')}>
            <span className="text-lg">⚫</span> Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="font-crimson text-[13px] text-ink-ghost tracking-widest">OR</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 mb-4">
          {!isLogin && (
            <input
              className="form-input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => onChangeName(e.target.value)}
            />
          )}
          <input
            className="form-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => onChangeEmail(e.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => onChangePassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
          />
        </div>

        {/* Inline error */}
        {error && (
          <p className="font-crimson text-[14px] mb-3.5" style={{ color: '#e06060' }}>{error}</p>
        )}

        {/* Submit */}
        <button className="btn-primary mb-3.5" onClick={onSubmit}>
          {loading
            ? <span className="w-[18px] h-[18px] border-2 border-surface-dark border-t-transparent rounded-full animate-spin" />
            : isLogin ? 'Sign In' : 'Create Account'
          }
        </button>

        {/* Mode toggle */}
        <p className="font-crimson text-[15px] text-ink-subtle text-center">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <button
            className="text-brand-gold underline bg-transparent border-none cursor-pointer font-crimson text-[15px]"
            onClick={onChangeMode}
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  )
}
