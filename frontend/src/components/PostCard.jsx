/**
 * A single discussion post.
 *
 * @param {{
 *   post:        import('../data/posts').Post,
 *   accentColor: string,
 *   isLiked:     boolean,
 *   onLike:      () => void,
 * }} props
 */
export default function PostCard({ post, accentColor, isLiked, onLike }) {
  // Deterministic avatar color per username
  const hue = (post.user.charCodeAt(0) * 53) % 360

  return (
    <div className="post-card">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="avatar"
          style={{ background: `hsl(${hue},25%,18%)`, border: `1px solid hsl(${hue},25%,26%)` }}
        >
          {post.initials}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-crimson text-[15px] font-semibold text-ink-muted">
              {post.user}
            </span>
            <div className="flex items-center gap-2">
              <span
                className="pill text-[10px] py-0.5 px-2"
                style={{
                  color:      `${accentColor}aa`,
                  background: `${accentColor}0e`,
                  border:     `1px solid ${accentColor}20`,
                }}
              >
                Ch. {post.ch}
              </span>
              <span className="font-crimson text-[12px] text-ink-ghost">{post.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <p className="font-crimson text-[17px] text-ink-muted leading-relaxed mb-3.5 ml-12">
        {post.text}
      </p>

      {/* Actions */}
      <div className="flex gap-2 ml-12">
        <button className={`btn-action ${isLiked ? 'liked' : ''}`} onClick={onLike}>
          ♥ {post.likes + (isLiked ? 1 : 0)}
        </button>
        <button className="btn-action">
          ↩ {post.replies}
        </button>
      </div>
    </div>
  )
}
