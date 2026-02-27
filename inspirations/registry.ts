import fs from 'fs';
import path from 'path';

export interface InspirationSlide {
  title: string;
  html: string;
}

export interface InspirationPresentation {
  name: string;
  slides: InspirationSlide[];
}

const INSPIRATIONS_DIR = path.join(process.cwd(), 'inspirations');

function getPresentationSlides(presentationName: string): InspirationSlide[] {
  const presentationPath = path.join(INSPIRATIONS_DIR, presentationName);
  const slides: InspirationSlide[] = [];
  
  if (!fs.existsSync(presentationPath) || !fs.statSync(presentationPath).isDirectory()) return [];

  const files = fs.readdirSync(presentationPath).sort((a, b) => {
    // Sort by slide number in filename (slide-1.html, slide-2.html, etc)
    const numA = parseInt(a.match(/\d+/)?. [0] || '0');
    const numB = parseInt(b.match(/\d+/)?. [0] || '0');
    return numA - numB;
  });

  for (const file of files) {
    if (file.endsWith('.html')) {
      const filePath = path.join(presentationPath, file);
      const html = fs.readFileSync(filePath, 'utf8');
      
      // Extract title from filename or just use a generic one
      // In a better system, we might parse the HTML for a title
      const title = file.replace('.html', '').replace(/-/g, ' ');
      
      slides.push({
        title,
        html
      });
    }
  }

  return slides;
}

export const getInspirations = (): InspirationPresentation[] => {
  if (!fs.existsSync(INSPIRATIONS_DIR)) return [];

  const presentations = fs.readdirSync(INSPIRATIONS_DIR).filter(item => {
    const p = path.join(INSPIRATIONS_DIR, item);
    return fs.statSync(p).isDirectory();
  });
  return presentations.map(presName => ({
    name: presName.replace(/-/g, ' '),
    slides: getPresentationSlides(presName)
  }));
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
    output += `#### Presentation: ${pres.name}\n`;
    pres.slides.forEach((slide, idx) => {
      output += `\n**Example Slide ${idx + 1}: ${slide.title.toUpperCase()}**\n`;
      output += stripImages(slide.html) + '\n';
    });
    output += '\n---\n\n';
  });

  return output;
};
