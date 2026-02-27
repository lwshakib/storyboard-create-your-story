import fs from 'fs';
import path from 'path';

export interface InspirationSlide {
  title: string;
  html: string;
  description?: string;
  content?: string;
}

export interface InspirationPresentation {
  name: string;
  title: string;
  description: string;
  slides: InspirationSlide[];
}

const INSPIRATIONS_DIR = path.join(process.cwd(), 'inspirations');

function getPresentationSlides(presentationName: string): InspirationSlide[] {
  const presentationPath = path.join(INSPIRATIONS_DIR, presentationName);
  const slides: InspirationSlide[] = [];
  
  if (!fs.existsSync(presentationPath) || !fs.statSync(presentationPath).isDirectory()) return [];

  const outlinePath = path.join(presentationPath, 'outline.json');
  let outline: any = null;
  if (fs.existsSync(outlinePath)) {
    outline = JSON.parse(fs.readFileSync(outlinePath, 'utf8'));
  }

  const files = fs.readdirSync(presentationPath).filter(f => f.endsWith('.html')).sort((a, b) => {
    // Sort by slide number in filename (slide-1.html, slide-2.html, etc)
    const numA = parseInt(a.match(/\d+/)?. [0] || '0');
    const numB = parseInt(b.match(/\d+/)?. [0] || '0');
    return numA - numB;
  });

  for (const [index, file] of files.entries()) {
    const filePath = path.join(presentationPath, file);
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Use data from outline if available, otherwise fallback to filename based titles
    const slideOutline = outline?.slides?.[index];
    const title = slideOutline?.title || file.replace('.html', '').replace(/-/g, ' ');
    
    slides.push({
      title,
      html,
      description: slideOutline?.description,
      content: slideOutline?.content
    });
  }

  return slides;
}

export const getInspirations = (): InspirationPresentation[] => {
  if (!fs.existsSync(INSPIRATIONS_DIR)) return [];

  const presentations = fs.readdirSync(INSPIRATIONS_DIR).filter(item => {
    const p = path.join(INSPIRATIONS_DIR, item);
    return fs.statSync(p).isDirectory();
  });

  return presentations.map(presName => {
    const presPath = path.join(INSPIRATIONS_DIR, presName);
    const outlinePath = path.join(presPath, 'outline.json');
    let title = presName.replace(/-/g, ' ');
    let description = `High-fidelity presentation template: ${title}`;

    if (fs.existsSync(outlinePath)) {
      try {
        const outline = JSON.parse(fs.readFileSync(outlinePath, 'utf8'));
        title = outline.title || title;
        description = outline.description || description;
      } catch (e) {
        console.error(`Error parsing outline.json for ${presName}:`, e);
      }
    }

    return {
      name: presName,
      title,
      description,
      slides: getPresentationSlides(presName)
    };
  });
};

export const formatInspirationsForPrompt = (): string => {
  const inspirations = getInspirations();
  let output = '### 🍱 Premium Design Inspirations (Agency-Level Examples):\n\n';

  // Function to strip image sources from HTML
  const stripImages = (html: string) => {
    return html
      .replace(/src="[^"]*"/g, 'src=""')
      .replace(/url\(['"]?.*?['"]?\)/g, "none") // Enhanced CSS url stripping
      .replace(/https?:\/\/image\.pollinations\.ai\/[^"'\s]*/g, "") // Explicitly target pollinations
      .replace(/background-image:\s*url\('[^']*'\)/g, "background-image: none");
  };

  inspirations.forEach((pres) => {
    output += `#### Presentation: ${pres.title}\n`;
    output += `Overall Description: ${pres.description}\n`;
    pres.slides.forEach((slide, idx) => {
      output += `\n**Example Slide ${idx + 1}: ${slide.title.toUpperCase()}**\n`;
      if (slide.description) output += `*Design Concept:* ${slide.description}\n`;
      if (slide.content) output += `*Core Content:* ${slide.content}\n`;
      output += `*HTML Structure:*\n${stripImages(slide.html)}\n`;
    });
    output += '\n---\n\n';
  });

  return output;
};
