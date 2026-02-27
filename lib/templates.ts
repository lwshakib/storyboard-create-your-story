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
    const files = fs.readdirSync(folderPath).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?. [0] || '0');
        const numB = parseInt(b.match(/\d+/)?. [0] || '0');
        return numA - numB;
    });

    const slides: Slide[] = files
      .filter(f => f.endsWith('.html'))
      .map((file, index) => {
        const content = fs.readFileSync(path.join(folderPath, file), 'utf8');
        return {
          id: index + 1,
          html: content,
          elements: [] 
        };
      });

    return {
      id: folder,
      title: folder.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `High-fidelity presentation template: ${folder.replace(/-/g, ' ')}`,
      thumbnail: "/placeholder.png", 
      slides,
    };
  });
}
