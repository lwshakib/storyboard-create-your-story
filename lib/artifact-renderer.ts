export interface Artifact {
  title: string;
  type: 'web' | 'app';
  content: string;
  isComplete: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function extractArtifacts(text: string): Artifact[] {
  const artifacts: Artifact[] = [];
  
  // Match <storyboard-wrapper> and individual <slide-X> tags
  // Actually, the user's prompt suggests <web_artifact> or <app_artifact> might also be used
  // but the structure example shows <storyboard-wrapper> containing <slide-X>.
  
  // Let's handle the specific <slide-X> structure first as it's the core of the presentation
  const slideRegex = /<(slide-(\d+))\s+title=["'](.*?)["'][^>]*>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = slideRegex.exec(text)) !== null) {
    const id = match[2];
    const title = match[3];
    const content = match[4].trim();
    
    // Check if it's already complete (has closing tag in the source text)
    const isComplete = text.includes(`</slide-${id}>`);

    artifacts.push({
      title: title || `Slide ${id}`,
      type: 'web', // Presentations are typically web-sized
      content: content,
      isComplete: isComplete
    });
  }

  // Also check for <web_artifact> or <app_artifact> tags which might be used for single screens
  const standaloneRegex = /<(web_artifact|app_artifact)\s+title=["'](.*?)["'][^>]*>([\s\S]*?)(?:<\/\1>|$)/g;
  while ((match = standaloneRegex.exec(text)) !== null) {
    const type = match[1] === 'app_artifact' ? 'app' : 'web';
    const title = match[2];
    const content = match[3].trim();
    const isComplete = text.includes(`</${match[1]}>`);

    // Avoid duplicating if it was already matched in a slide (unlikely but safe)
    if (!artifacts.some(a => a.title === title)) {
      artifacts.push({
        title,
        type,
        content,
        isComplete
      });
    }
  }

  return artifacts;
}

export function stripArtifact(text: string): string {
  // Removes the artifact tags and content from the conversational text
  return text
    .replace(/<storyboard-wrapper>[\s\S]*?<\/storyboard-wrapper>/g, '')
    .replace(/<(slide-\d+|web_artifact|app_artifact)[^>]*>[\s\S]*?(?:<\/\1>|$)/g, '')
    .trim();
}
