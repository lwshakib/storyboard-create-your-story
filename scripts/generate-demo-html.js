const fs = require('fs');
const path = require('path');

const INSPIRATIONS_DIR = path.join(process.cwd(), 'llm/inspirations/presentations');
const OUTPUT_FILE = path.join(process.cwd(), 'inspirations-demo.html');

function getInspirations() {
  if (!fs.existsSync(INSPIRATIONS_DIR)) return [];
  
  const presentations = fs.readdirSync(INSPIRATIONS_DIR);
  return presentations.map(presName => {
    const presPath = path.join(INSPIRATIONS_DIR, presName);
    const slides = fs.readdirSync(presPath)
      .filter(f => f.endsWith('.html'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      })
      .map(file => ({
        name: file.replace('.html', '').toUpperCase(),
        html: fs.readFileSync(path.join(presPath, file), 'utf8')
      }));
      
    return { name: presName.replace(/-/g, ' ').toUpperCase(), slides };
  });
}

const inspirations = getInspirations();

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Inspirations Registry - Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #050505; color: white; font-family: sans-serif; }
        .slide-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }
        .slide-wrapper {
            background: rgba(255,255,255,0.02);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid rgba(255,255,255,0.05);
            transition: all 0.3s ease;
        }
        .slide-wrapper:hover {
            border-color: #06b6d4;
            background: rgba(6, 182, 212, 0.05);
            transform: translateY(-4px);
        }
        .preview-container {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* 16:9 Aspect Ratio */
            overflow: hidden;
            border-radius: 8px;
            background: black;
        }
        .preview-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 1024px;
            height: 576px;
            transform-origin: top left;
            border: none;
            pointer-events: none;
        }
    </style>
    <script>
        function resizeIframes() {
            const containers = document.querySelectorAll('.preview-container');
            containers.forEach(container => {
                const iframe = container.querySelector('iframe');
                if (!iframe) return;
                const scale = container.offsetWidth / 1024;
                iframe.style.transform = \`scale(\${scale})\`;
            });
        }
        window.addEventListener('resize', resizeIframes);
        window.addEventListener('load', resizeIframes);
    </script>
</head>
<body class="p-8 pb-32">
    <div class="mx-auto">
        <header class="mb-20 text-center">
            <h1 class="text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">Design Registry</h1>
            <p class="text-slate-500 font-bold uppercase tracking-[0.4em] text-sm italic">Premium Pattern Gallery & Architecture Samples</p>
        </header>

        ${inspirations.map(pres => `
            <section class="mb-32">
                <div class="flex items-center gap-4 mb-10 border-l-4 border-cyan-500 pl-6">
                    <h2 class="text-3xl font-black uppercase tracking-tight text-slate-100">${pres.name}</h2>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">${pres.slides.length} Slides</span>
                </div>
                
                <div class="slide-grid">
                    ${pres.slides.map(slide => `
                        <div class="slide-wrapper">
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-[10px] font-black text-cyan-500 uppercase tracking-widest">${slide.name}</span>
                            </div>
                            <div class="preview-container shadow-2xl">
                                <iframe 
                                    srcdoc="${slide.html.replace(/"/g, '&quot;')}"
                                ></iframe>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `).join('')}
    </div>
</body>
</html>
`;

fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log('Successfully generated inspirations-demo.html in root.');
