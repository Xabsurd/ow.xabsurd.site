import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

export function renderMarkdown(markdown: string) {
  const html = md.render(markdown)
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'img']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'nofollow noopener noreferrer'
      }),
      img: sanitizeHtml.simpleTransform('img', {
        loading: 'lazy'
      })
    }
  })
}
