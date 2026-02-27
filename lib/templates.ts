import fs from 'fs';
import path from 'path';
import { Slide } from '@/types/editor';

export interface Template {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  slides: Slide[];

}

const INSPIRATIONS_DIR = path.join(process.cwd(), 'inspirations');

export function getTemplates(): Template[] {
  if (!fs.existsSync(INSPIRATIONS_DIR)) {
    console.warn(`Inspirations directory not found at: ${INSPIRATIONS_DIR}`);
    return [];
  }

  const items = fs.readdirSync(INSPIRATIONS_DIR);
  const folders = items.filter(f => {
    try {
        return fs.statSync(path.join(INSPIRATIONS_DIR, f)).isDirectory();
    } catch (e) {
        return false;
    }
  });

  return folders.map(folder => {
    const folderPath = path.join(INSPIRATIONS_DIR, folder);
    const outlinePath = path.join(folderPath, 'outline.json');
    let outline: any = null;
    if (fs.existsSync(outlinePath)) {
      try {
        outline = JSON.parse(fs.readFileSync(outlinePath, 'utf8'));
      } catch (e) {
        console.error(`Error parsing outline.json for ${folder}:`, e);
      }
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html')).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?. [0] || '0');
        const numB = parseInt(b.match(/\d+/)?. [0] || '0');
        return numA - numB;
    });

    const slides: Slide[] = files.map((file, index) => {
        const content = fs.readFileSync(path.join(folderPath, file), 'utf8');
        // Extract first image src
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        const bgImage = imgMatch ? imgMatch[1] : `https://placehold.co/800x450/0f172a/white?text=Slide+${index + 1}`;
        
        const slideOutline = outline?.slides?.[index];

        return {
          id: index + 1,
          html: content,
          bgImage,
          title: slideOutline?.title || file.replace('.html', '').replace(/-/g, ' '),
          description: slideOutline?.description || "",
          content: slideOutline?.content || "",
          elements: [] 
        };
      });

    const firstSlideImage = slides.length > 0 ? slides[0].bgImage : "https://placehold.co/800x450/0f172a/white?text=Template";

    return {
      id: folder,
      title: outline?.title || folder.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: outline?.description || `High-fidelity presentation template: ${folder.replace(/-/g, ' ')}`,
      thumbnail: firstSlideImage || "https://placehold.co/800x450/0f172a/white?text=Template", 
      slides,
    };
  });
}
