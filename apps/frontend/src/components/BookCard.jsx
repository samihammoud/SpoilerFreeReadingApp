import BookCover from "./BookCover";
import { GENRE_COLORS } from "../data/books";

/**
 * A single book card shown on the Home page.
 *
 * @param {{
 *   book:       import('../data/books').Book,
 *   progress:   number | undefined,
 *   isPinned:   boolean,
 *   onOpen:     () => void,
 *   onTogglePin: (e: React.MouseEvent) => void,
 *   animClass:  string,
 * }} props
 */
export default function BookCard({
  book,
  progress,
  isPinned,
  onOpen,
  onTogglePin,
  animClass,
}) {
  const genreColor = GENRE_COLORS[book.genre] ?? "#c8a048";
  const pct = progress ? Math.round((progress / book.chapters) * 100) : 0;

  return (
    <div
      className={`book-card ${isPinned ? "pinned" : ""} ${animClass}`}
      onClick={onOpen}
    >
      {/* Pin toggle */}
      <button
        className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer
                   text-[17px] leading-none p-0.5 opacity-30
                   transition-all duration-150 hover:opacity-80 hover:scale-110 z-10"
        style={{ opacity: isPinned ? 1 : undefined }}
        onClick={onTogglePin}
        title={isPinned ? "Unpin" : "Pin to top"}
      >
        {isPinned ? "📌" : "📍"}
      </button>

      <div className="flex gap-4 pr-7">
        <BookCover book={book} width={72} height={102} radius={8} />

        <div className="flex-1 min-w-0">
          {/* Genre + reader count */}
          <div className="flex justify-between items-start mb-1.5">
            <span
              className="pill"
              style={{
                color: genreColor,
                background: `${genreColor}18`,
                border: `1px solid ${genreColor}28`,
              }}
            >
              {book.genre}
            </span>
            <span className="font-crimson text-[12px] text-ink-ghost">
              {book.readers.toLocaleString()} readers
            </span>
          </div>

          {/* Title */}
          <h2
            className="font-display text-[17px] font-bold text-ink mb-0.5 leading-snug"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.title}
          </h2>

          {/* Author */}
          <p className="font-crimson text-[14px] text-ink-subtle italic mb-3.5">
            {book.author}
          </p>

          {/* Progress bar or CTA */}
          {progress !== undefined ? (
            <>
              <div className="flex justify-between mb-1.5">
                <span className="font-crimson text-[13px] text-ink-subtle">
                  Ch. {progress} / {book.chapters}
                </span>
                <span
                  className="font-crimson text-[13px] font-semibold"
                  style={{ color: genreColor }}
                >
                  {pct}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${genreColor}70, ${genreColor})`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="font-crimson text-[13px] text-ink-ghost italic">
              Set your progress to join →
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
