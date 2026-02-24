/**
 * Full-screen splash shown for ~2.4 s on first load.
 * Auto-advances via a timeout in App.jsx.
 */
export default function SplashScreen() {
  const rings = [280, 380, 480, 580]

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-surface-dark">
      {/* Ambient rings */}
      {rings.map((size, i) => (
        <div
          key={size}
          className="splash-ring"
          style={{
            width:  size,
            height: size,
            top:    `calc(50% - ${size / 2}px)`,
            left:   `calc(50% - ${size / 2}px)`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      {/* Warm centre glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 320, height: 320,
          background: 'radial-gradient(circle,rgba(200,160,72,.08) 0%,transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        }}
      />

      {/* Logo */}
      <div className="animate-float-y text-center z-10">
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center
                     text-4xl mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg,#c8a048,#7a5820)',
            boxShadow:  '0 16px 48px rgba(200,160,72,.3)',
          }}
        >
          📖
        </div>

        <h1 className="font-display text-[38px] font-bold text-ink tracking-tight leading-none">
          Chapter<span className="text-brand-gold">&amp;</span>Verse
        </h1>

        <p className="font-crimson text-base text-ink-subtle italic mt-2.5 animate-shimmer">
          Read together. Discuss freely.
        </p>
      </div>
    </div>
  )
}
