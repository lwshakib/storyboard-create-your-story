export interface HtmlSlide {
  id: number
  title: string
  html: string
}

export interface StoryboardData {
  title: string
  slides: HtmlSlide[]
}

export function parseStoryboard(text: string): StoryboardData {
  const result: StoryboardData = { title: 'Advanced Storyboard', slides: [] }

  // Extract title
  const titleMatch = text.match(/<title[^>]+name=["'](.*?)["']/)
  if (titleMatch) {
    result.title = titleMatch[1]
  }

  // Extract slides using a more robust regex
  // Matches <slide-1 title="...">...</slide-1>
  const slideRegex = /<(slide-(\d+))\s+title=["'](.*?)["'][^>]*>([\s\S]*?)<\/\1>/g
  let match

  while ((match = slideRegex.exec(text)) !== null) {
    const id = parseInt(match[2])
    const title = match[3]
    const html = match[4].trim()
    
    // Check if slide already exists to avoid duplicates (though regex exec with g flag should handle this)
    if (!result.slides.find(s => s.id === id)) {
      result.slides.push({ id, title, html })
    }
  }

  // Sort slides by id to ensure correct order
  result.slides.sort((a, b) => a.id - b.id)

  return result
}
