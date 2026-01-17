const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'llm/inspirations/presentations');
const dirs = fs.readdirSync(baseDir);

const titles = {
  'china-powerhouse': "China's Powerhouse Economy",
  'creative-marketing-campaign': "Elite Marketing Strategy",
  'eco-urban-renewal': "Eco-Urban Renewal",
  'future-tech-summit': "Future Tech Summit",
  'global-fintech-trends': "Global FinTech Trends",
  'healthcare-of-tomorrow': "Healthcare of Tomorrow",
  'space-exploration-handbook': "Space Exploration Roadmap"
};

const descriptions = {
  'china-powerhouse': "Advanced architectural analysis of China's economic and manufacturing dominance.",
  'creative-marketing-campaign': "High-impact presentation design for creative agencies and brand launches.",
  'eco-urban-renewal': "Futuristic sustainable city planning with integrated green technology.",
  'future-tech-summit': "The defining gathering for emerging technologies and digital transformation.",
  'global-fintech-trends': "Comprehensive overview of the digital finance landscape and new banking frontiers.",
  'healthcare-of-tomorrow': "Exploring revolutionary medical tech, AI diagnostics, and patient-centric care.",
  'space-exploration-handbook': "The ultimate guide to off-world colonization and deep space mining."
};

const advancedTemplates = dirs.map(dir => {
  const dirPath = path.join(baseDir, dir);
  if (!fs.statSync(dirPath).isDirectory()) return null;

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort((a,b) => {
    const na = parseInt(a.match(/\d+/)?.[0] || 0);
    const nb = parseInt(b.match(/\d+/)?.[0] || 0);
    return na - nb;
  });
  
  const slides = files.map((file, index) => {
    const html = fs.readFileSync(path.join(dirPath, file), 'utf8');
    return {
      id: index,
      html: html,
      elements: [], 
      title: 'Slide ' + (index + 1)
    };
  });
  
  let thumbnail = '/templates/prod_hero_new.png'; 
  const firstSlideHtml = slides[0].html;
  const match = firstSlideHtml.match(/src="([^"]+)"/);
  if (match) thumbnail = match[1];

  return {
    id: 'adv-' + dir,
    title: titles[dir] || dir,
    description: descriptions[dir] || 'Advanced presentation template.',
    thumbnail: thumbnail,
    slides: slides,
    type: 'ADVANCED'
  };
}).filter(Boolean);

const output = `import { Template } from "./templates-data";

export const AdvancedTemplates: Template[] = ${JSON.stringify(advancedTemplates, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'lib/advanced-templates.ts'), output);
console.log('Generated lib/advanced-templates.ts');
