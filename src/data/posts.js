/**
 * @typedef {Object} Post
 * @property {number} id
 * @property {number} ch        - chapter the post is tagged to
 * @property {string} user
 * @property {string} initials
 * @property {string} text
 * @property {number} likes
 * @property {number} replies
 * @property {string} time
 */

/** @type {Post[]} */
export const POSTS = [
  { id: 1,  ch: 1,  user: 'readingwitch',  initials: 'RW', text: 'Just started! The opening pages are so atmospheric. Anyone else feel immediately pulled in?',                       likes: 42,  replies: 8,  time: '3h ago'  },
  { id: 2,  ch: 1,  user: 'pageflipper99', initials: 'PF', text: 'The world-building is subtle but incredibly dense. I love how much is implied without being stated.',               likes: 31,  replies: 5,  time: '5h ago'  },
  { id: 3,  ch: 3,  user: 'lore_keeper',   initials: 'LK', text: 'OK the mythology introduced in chapter 3 is doing a LOT of heavy lifting and I am HERE for it.',                   likes: 87,  replies: 14, time: '1d ago'  },
  { id: 4,  ch: 5,  user: 'nightreader',   initials: 'NR', text: 'The pacing here is incredibly deliberate. Some might find it slow but I think it\'s building something enormous.',  likes: 56,  replies: 11, time: '1d ago'  },
  { id: 5,  ch: 8,  user: 'thelibrarian',  initials: 'TL', text: 'Chapter 8 made me put the book down just to breathe for a second. That scene is something else entirely.',          likes: 203, replies: 31, time: '2d ago'  },
  { id: 6,  ch: 12, user: 'velvetpages',   initials: 'VP', text: 'The character work at this stage is genuinely exceptional. We\'re seeing so many layers revealed.',                 likes: 119, replies: 22, time: '3d ago'  },
  { id: 7,  ch: 15, user: 'bookdragon',    initials: 'BD', text: 'I had to re-read chapter 15 twice because the foreshadowing is insane once you notice it.',                          likes: 88,  replies: 17, time: '4d ago'  },
  { id: 8,  ch: 20, user: 'quillcraft',    initials: 'QC', text: 'The midpoint is upon us and the tension has been building so methodically. The payoffs are starting.',               likes: 145, replies: 28, time: '5d ago'  },
  { id: 9,  ch: 25, user: 'marginalia',    initials: 'MA', text: 'The themes of memory and identity are crystallizing beautifully now. This is a genuinely profound book.',            likes: 167, replies: 33, time: '6d ago'  },
  { id: 10, ch: 30, user: 'readingwitch',  initials: 'RW', text: 'The final third is something else entirely. Everything is accelerating. I\'m reading faster than I should.',        likes: 234, replies: 45, time: '1w ago'  },
]
