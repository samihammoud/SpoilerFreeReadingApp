import { useState } from 'react'
import BookCard      from '../components/BookCard'
import { BOOKS, TOTAL_READERS } from '../data/books'

const STAGGER = ['animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.04s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.08s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.12s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.16s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.20s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.24s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.28s_both]',
                 'animate-[fadeUp_.34s_cubic-bezier(.22,.68,0,1.15)_.32s_both]']

/**
 * @param {{
 *   user:          { name: string, email: string },
 *   userProgress:  Record<number, number>,
 *   pinnedIds:     Set<number>,
 *   onOpenBook:    (book: import('../data/books').Book) => void,
 *   onTogglePin:   (e: React.MouseEvent, bookId: number) => void,
 *   onOpenSettings:() => void,
 * }} props
 */
export default function HomeScreen({
  user, userProgress, pinnedIds, onOpenBook, onTogglePin, onOpenSettings,
}) {
  const [query, setQuery] = useState('')

  const filtered = BOOKS.filter(b =>
    !query.trim() ||
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase()) ||
    b.genre.toLowerCase().includes(query.toLowerCase())
  )

  const pinned   = filtered.filter(b =>  pinnedIds.has(b.id))
  const unpinned = filtered.filter(b => !pinnedIds.has(b.id))

  return (
    <div className="max-w-5xl mx-auto px-5 pt-11 pb-20 animate-fade-up">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg,#c8a048,#7a5820)' }}
            >
              📖
            </div>
            <h1 className="font-display text-[26px] font-bold text-ink tracking-tight">
              Chapter<span className="text-brand-gold">&amp;</span>Verse
            </h1>
          </div>
          <p className="font-crimson text-[15px] text-ink-subtle italic pl-[44px]">
            Welcome back, {user.name}
          </p>
        </div>

        <button className="btn-icon" onClick={onOpenSettings} title="Settings">⚙️</button>
      </div>

      {/* ── Search ─────────────────────────────────────────────────── */}
      <div className="relative mb-6">
        <span className="absolute left-[15px] top-1/2 -translate-y-1/2 text-ink-faint text-[17px] pointer-events-none">
          🔍
        </span>
        <input
          className="search-input"
          type="text"
          placeholder="Search by title, author, or genre…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-border border-none
                       rounded-full w-[22px] h-[22px] text-ink-subtle cursor-pointer text-[12px]
                       flex items-center justify-center transition-colors hover:bg-surface-border-hover hover:text-ink"
            onClick={() => setQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Pinned section ─────────────────────────────────────────── */}
      {pinned.length > 0 && (
        <section className="mb-6">
          <div className="section-label">📌 Pinned</div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(430px, 1fr))' }}>
            {pinned.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                progress={userProgress[book.id]}
                isPinned
                animClass={STAGGER[Math.min(i, 7)]}
                onOpen={() => onOpenBook(book)}
                onTogglePin={e => onTogglePin(e, book.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── All / unpinned books ────────────────────────────────────── */}
      {unpinned.length > 0 && (
        <section>
          {pinned.length > 0 ? (
            <div className="section-label">{query ? 'Results' : 'All Books'}</div>
          ) : (
            <div className="flex justify-between items-center mb-3.5">
              <p className="font-crimson text-[13px] tracking-[1.2px] uppercase text-ink-faint">
                {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Reading Rooms'}
              </p>
              {!query && (
                <p className="font-crimson text-[13px] text-ink-ghost">
                  {TOTAL_READERS.toLocaleString()} active readers
                </p>
              )}
            </div>
          )}

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(430px, 1fr))' }}>
            {unpinned.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                progress={userProgress[book.id]}
                isPinned={false}
                animClass={STAGGER[Math.min(i, 7)]}
                onOpen={() => onOpenBook(book)}
                onTogglePin={e => onTogglePin(e, book.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="text-center py-16 animate-fade-up">
          <div className="text-[36px] mb-4">📭</div>
          <p className="font-display text-xl text-ink-faint mb-2">No books found</p>
          <p className="font-crimson text-base text-ink-ghost italic">Try a different title, author, or genre</p>
        </div>
      )}
    </div>
  )
}
