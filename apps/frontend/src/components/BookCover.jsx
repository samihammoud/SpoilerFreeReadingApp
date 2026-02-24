import { useState } from 'react'

/**
 * Loads a book cover from Open Library by ISBN.
 * Falls back to a styled gradient with the title/author when the image fails.
 *
 * @param {{ book: import('../data/books').Book, width?: number, height?: number, radius?: number }} props
 */
export default function BookCover({ book, width = 72, height = 102, radius = 8 }) {
  const [error, setError] = useState(false)

  const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`

  return (
    <div
      style={{
        width,
        height,
        borderRadius:  radius,
        background:    book.coverFallback,
        flexShrink:    0,
        overflow:      'hidden',
        boxShadow:     '0 4px 20px rgba(0,0,0,0.55)',
      }}
    >
      {!error ? (
        <img
          src={coverUrl}
          alt={book.title}
          onError={() => setError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            width: '100%', height: '100%',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        8,
            textAlign:      'center',
          }}
        >
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 700, lineHeight: 1.3 }}>
            {book.title}
          </span>
          <span style={{ fontFamily: "'Crimson Text',serif", fontSize: 7.5, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic' }}>
            {book.author.split(' ').pop()}
          </span>
        </div>
      )}
    </div>
  )
}
