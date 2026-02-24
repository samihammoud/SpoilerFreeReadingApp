import { ONBOARDING_SLIDES } from '../data/onboarding'

/**
 * @param {{
 *   step:     number,
 *   onNext:   () => void,
 *   onSkip:   () => void,
 *   onFinish: () => void,
 * }} props
 */
export default function OnboardingScreen({ step, onNext, onSkip, onFinish }) {
  const slide     = ONBOARDING_SLIDES[step]
  const isLast    = step === ONBOARDING_SLIDES.length - 1

  return (
    <div className="fixed inset-0 bg-surface-dark flex flex-col items-center justify-center px-8 py-10">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Slide icon */}
        <div
          className="w-22 h-22 rounded-[28px] flex items-center justify-center
                     text-[40px] mx-auto mb-8"
          style={{
            width:     88,
            height:    88,
            background:'linear-gradient(135deg,#2a2010,#4a3818)',
            border:    '1px solid #3a3020',
            boxShadow: '0 12px 40px rgba(0,0,0,.5)',
          }}
        >
          {slide.icon}
        </div>

        {/* Text */}
        <h2
          className="font-display text-[30px] font-bold text-ink text-center leading-snug mb-4"
          style={{ whiteSpace: 'pre-line' }}
        >
          {slide.title}
        </h2>
        <p className="font-crimson text-[18px] text-ink-subtle text-center leading-relaxed mb-12">
          {slide.body}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-9">
          {ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} className={`ob-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {isLast ? (
            <button className="btn-primary" onClick={onFinish}>Get Started</button>
          ) : (
            <>
              <button className="btn-primary" onClick={onNext}>Next</button>
              <button className="btn-ghost"   onClick={onSkip}>Skip</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
