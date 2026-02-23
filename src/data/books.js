/**
 * @typedef {Object} Book
 * @property {number}   id
 * @property {string}   title
 * @property {string}   author
 * @property {string}   isbn
 * @property {number}   chapters
 * @property {string}   genre
 * @property {number}   readers
 * @property {string}   accentColor
 * @property {string}   coverFallback   - CSS gradient used when cover image fails
 */

/** @type {Book[]} */
export const BOOKS = [
  { id: 1, title: 'The Name of the Wind',              author: 'Patrick Rothfuss', isbn: '9780756404079', chapters: 92, genre: 'Fantasy',         readers: 4821, accentColor: '#d4943a', coverFallback: 'linear-gradient(145deg,#3a2010,#7a4a1a)' },
  { id: 2, title: 'Project Hail Mary',                  author: 'Andy Weir',        isbn: '9780593135204', chapters: 34, genre: 'Sci-Fi',          readers: 3204, accentColor: '#3ab8c4', coverFallback: 'linear-gradient(145deg,#081828,#1a5f7a)' },
  { id: 3, title: 'Piranesi',                           author: 'Susanna Clarke',   isbn: '9781526622426', chapters: 60, genre: 'Mystery',         readers: 2918, accentColor: '#a080cc', coverFallback: 'linear-gradient(145deg,#180a28,#5a3a8a)' },
  { id: 4, title: 'The Midnight Library',               author: 'Matt Haig',        isbn: '9780525559474', chapters: 81, genre: 'Literary Fiction', readers: 5102, accentColor: '#4aac6a', coverFallback: 'linear-gradient(145deg,#081808,#2a6a3a)' },
  { id: 5, title: 'Lessons in Chemistry',               author: 'Bonnie Garmus',    isbn: '9780385547345', chapters: 45, genre: 'Literary Fiction', readers: 3891, accentColor: '#e06060', coverFallback: 'linear-gradient(145deg,#280808,#8a2a2a)' },
  { id: 6, title: 'Fourth Wing',                        author: 'Rebecca Yarros',   isbn: '9781649374042', chapters: 65, genre: 'Fantasy',         readers: 6234, accentColor: '#c0843a', coverFallback: 'linear-gradient(145deg,#201008,#6a3810)' },
  { id: 7, title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin',isbn: '9780593321201', chapters: 38, genre: 'Literary Fiction', readers: 4102, accentColor: '#d4b040', coverFallback: 'linear-gradient(145deg,#201808,#7a6020)' },
  { id: 8, title: 'The House in the Cerulean Sea',      author: 'TJ Klune',         isbn: '9781250217318', chapters: 52, genre: 'Fantasy',         readers: 3567, accentColor: '#40a8d4', coverFallback: 'linear-gradient(145deg,#081828,#1a6888)' },
]

export const GENRE_COLORS = {
  Fantasy:          '#d4943a',
  'Sci-Fi':         '#3ab8c4',
  Mystery:          '#a080cc',
  'Literary Fiction':'#4aac6a',
}

export const TOTAL_READERS = BOOKS.reduce((sum, b) => sum + b.readers, 0)
