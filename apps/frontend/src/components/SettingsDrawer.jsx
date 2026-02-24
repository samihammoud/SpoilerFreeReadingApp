const MENU_ITEMS = [
  { icon: '👤', label: 'Edit Profile'        },
  { icon: '🔔', label: 'Notifications'       },
  { icon: '📚', label: 'My Reading List'     },
  { icon: '🎨', label: 'Appearance'          },
  { icon: '🔒', label: 'Privacy & Security'  },
  { icon: '❓', label: 'Help & Support'      },
]

/**
 * Slide-in settings drawer with user info and logout.
 *
 * @param {{
 *   user:     { name: string, email: string },
 *   onClose:  () => void,
 *   onLogout: () => void,
 * }} props
 */
export default function SettingsDrawer({ user, onClose, onLogout }) {
  return (
    <>
      {/* Backdrop */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <aside className="drawer">
        {/* Header */}
        <div className="px-6 pt-7 pb-5 border-b border-surface-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-ink">Settings</h2>
            <button className="btn-icon w-8 h-8 text-base" onClick={onClose}>✕</button>
          </div>

          {/* User profile summary */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-13 h-13 rounded-full flex items-center justify-center
                         font-display text-xl font-bold text-brand-gold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#3a2e1a,#5a4a28)',
                border:     '1px solid #4a3c24',
                width: 52, height: 52,
              }}
            >
              {user.name?.[0]?.toUpperCase() ?? 'R'}
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">{user.name}</p>
              <p className="font-crimson text-[13px] text-ink-subtle">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-4 pt-4">
          {MENU_ITEMS.map(({ icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-3.5 w-full bg-transparent border-none
                         rounded-xl px-3 py-3.5 text-ink-muted font-crimson text-base
                         cursor-pointer text-left mb-0.5
                         transition-all duration-150 hover:bg-surface-inset hover:text-ink"
            >
              <span className="text-[19px] w-6 text-center">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-7 pt-4 border-t border-surface-border mt-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-3.5 w-full bg-transparent
                       rounded-xl px-3 py-3.5 font-crimson text-base cursor-pointer text-left
                       transition-all duration-150"
            style={{ color: '#c05050', border: '1.5px solid #3a1a1a' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e0e0e'; e.currentTarget.style.borderColor = '#6a2a2a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#3a1a1a' }}
          >
            <span className="text-[19px] w-6 text-center">→</span>
            Log Out
          </button>

          <p className="font-crimson text-[12px] text-ink-ghost text-center mt-4">
            Chapter&amp;Verse v1.0.0
          </p>
        </div>
      </aside>
    </>
  )
}
