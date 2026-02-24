import { useState } from 'react'
import BookCover     from '../components/BookCover'
import PostCard      from '../components/PostCard'
import { POSTS }     from '../data/posts'

/**
 * @param {{
 *   book:           import('../data/books').Book,
 *   progress:       number,
 *   onBack:         () => void,
 *   onOpenSettings: () => void,
 *   onUpdateProgress: () => void,
 * }} props
 */
export default function ForumScreen({
  book, progress, onBack, onOpenSettings, onUpdateProgress,
}) {
  const [discussionRevealed, setDiscussionRevealed] = useState(false)
  const [newPost,  setNewPost]  = useState('')
  const [likedIds, setLikedIds] = useState(new Set())

  const pct          = Math.round((progress / book.chapters) * 100)
  const visiblePosts = POSTS.filter(p => p.ch <= progress)
  const lockedCount  = POSTS.filter(p => p.ch > progress).length

  const toggleLike = id =>
    setLikedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handlePost = () => {
    // TODO: wire to real API — for now just clear the field
    setNewPost('')
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 pb-20 animate-fade-up">

      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <button className="btn-back" onClick={onBack}>← Library</button>

        <div className="flex items-center gap-2.5">
          {/* Progress pill */}
          <button className="update-pill" onClick={onUpdateProgress}>
            <span
              className="w-2 h-2 rounded-full inline-block flex-shrink-0"
              style={{ background: book.accentColor }}
            />
            Ch. {progress} · {pct}% · Update
          </button>

          <button className="btn-icon" onClick={onOpenSettings}>⚙️</button>
        </div>
      </div>

      {/* ── Book header card ────────────────────────────────────────── */}
      <div className="bg-surface-inset border border-surface-border/60 rounded-[20px] p-5 mb-5 flex gap-5 items-center">
        <BookCover book={book} width={60} height={84} radius={8} />

        <div className="flex-1 min-w-0">
          <span
            className="pill mb-1.5 inline-block"
            style={{ color: book.accentColor, background: `${book.accentColor}18`, border: `1px solid ${book.accentColor}28` }}
          >
            {book.genre}
          </span>
          <h2 className="font-display text-[21px] font-bold text-ink mb-0.5 leading-snug">{book.title}</h2>
          <p className="font-crimson text-[14px] text-ink-subtle italic">{book.author}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-display text-[36px] font-bold leading-none" style={{ color: book.accentColor }}>
            {pct}%
          </div>
          <div className="font-crimson text-[12px] text-ink-faint mt-0.5">complete</div>
        </div>
      </div>

      {/* ── Spoiler shield notice ───────────────────────────────────── */}
      <div className="flex items-center gap-2.5 bg-surface-inset border border-surface-border/60 rounded-xl px-4 py-3 mb-5">
        <span className="text-[15px]">🛡️</span>
        <p className="font-crimson text-[15px] text-ink-subtle">
          Discussions locked to <strong className="text-ink">Chapter {progress}</strong> and earlier.
          {lockedCount > 0 && (
            <span className="text-ink-ghost"> {lockedCount} post{lockedCount !== 1 ? 's' : ''} hidden ahead.</span>
          )}
        </p>
      </div>

      {/* ── Compose (always visible) ────────────────────────────────── */}
      <div className="compose-box">
        <textarea
          className="compose-textarea"
          rows={3}
          placeholder={`Share your thoughts up to Ch. ${progress}…`}
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        {newPost && (
          <div className="flex justify-end mt-3 pt-3 border-t border-surface-border">
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={handlePost}
            >
              Post
            </button>
          </div>
        )}
      </div>

      {/* ── Discussion gate / revealed posts ────────────────────────── */}
      {!discussionRevealed ? (
        <div className="discussion-gate">
          {/* Skeleton preview rows */}
          <div className="flex flex-col gap-2 mb-6 pointer-events-none select-none">
            {[80, 60, 92, 45].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5 opacity-25">
                <div className="w-8 h-8 rounded-full bg-surface-border flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-2.5 rounded-full bg-surface-border" style={{ width: `${w}%` }} />
                  <div className="h-2.5 rounded-full bg-surface-border" style={{ width: `${Math.max(w - 20, 30)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px] mx-auto mb-3.5"
            style={{ background: '#1e1a12', border: '1px solid #2e2818' }}
          >
            💬
          </div>

          <p className="font-display text-xl font-bold text-ink mb-2">
            {visiblePosts.length} discussion{visiblePosts.length !== 1 ? 's' : ''}
          </p>

          <p className="font-crimson text-base text-ink-subtle italic leading-relaxed">
            {visiblePosts.length > 0
              ? `Spoiler-free threads up to Chapter ${progress} are ready.`
              : 'No discussions yet for your chapter. Be the first to post above!'}
          </p>

          {visiblePosts.length > 0 && (
            <button className="btn-reveal" onClick={() => setDiscussionRevealed(true)}>
              Show Discussion <span className="text-sm">↓</span>
            </button>
          )}
        </div>

      ) : (
        <div className="animate-reveal-down">
          {visiblePosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              accentColor={book.accentColor}
              isLiked={likedIds.has(post.id)}
              onLike={() => toggleLike(post.id)}
            />
          ))}

          {lockedCount > 0 && (
            <div className="locked-card">
              <div className="text-xl mb-2.5">🔒</div>
              <p className="font-display text-[17px] text-ink-faint mb-1.5">
                {lockedCount} more discussion{lockedCount !== 1 ? 's' : ''} ahead
              </p>
              <p className="font-crimson text-[14px] text-ink-ghost italic">
                Keep reading and update your progress to unlock them.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
