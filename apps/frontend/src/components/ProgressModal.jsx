import BookCover from './BookCover'

/**
 * Modal that lets the user set/update their reading progress for a book.
 *
 * @param {{
 *   book:         import('../data/books').Book,
 *   tempProgress: number,
 *   onChange:     (ch: number) => void,
 *   onConfirm:    () => void,
 *   onClose:      (() => void) | null,   // null = cannot close (first visit)
 * }} props
 */
export default function ProgressModal({ book, tempProgress, onChange, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose ?? undefined}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Book identity */}
        <div className="flex gap-4 items-center mb-6">
          <BookCover book={book} width={58} height={80} radius={8} />
          <div>
            <h3 className="font-display text-xl font-bold text-ink leading-snug mb-1">
              {book.title}
            </h3>
            <p className="font-crimson text-[14px] text-ink-subtle italic">{book.author}</p>
          </div>
        </div>

        <div className="h-px bg-surface-border mb-5" />

        <p className="font-crimson text-base text-ink-subtle italic mb-5 leading-relaxed">
          Set your current chapter. You'll only see discussions up to this point.
        </p>

        {/* Chapter slider */}
        <div className="mb-7">
          <div className="flex justify-between items-baseline mb-4">
            <span className="font-crimson text-[15px] text-ink-subtle">Chapter</span>
            <span className="font-display text-[32px] font-bold leading-none" style={{ color: book.accentColor }}>
              {tempProgress}
              <span className="font-crimson text-base text-ink-faint">/{book.chapters}</span>
            </span>
          </div>

          <input
            type="range"
            className="range-slider"
            min={1}
            max={book.chapters}
            value={tempProgress}
            onChange={e => onChange(Number(e.target.value))}
          />

          <div className="flex justify-between mt-1.5">
            <span className="font-crimson text-[12px] text-ink-ghost">Ch. 1</span>
            <span className="font-crimson text-[12px] text-ink-ghost">Ch. {book.chapters}</span>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ background: book.accentColor }}
          onClick={onConfirm}
        >
          Enter Discussion Room
        </button>
      </div>
    </div>
  )
}
