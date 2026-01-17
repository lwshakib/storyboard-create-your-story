const fs = require('fs');
const path = require('path');

const theme = {
    background: "#0b1020",
    foreground: "#f4f6ff",
    primary: "#7c5cff",
    card: "#121a33",
    border: "#202c56",
    accent: "#2fe6c7",
    muted: "#141d3a",
    mutedForeground: "#a9b2d6",
    radius: "0.9rem",
};

const baseDir = path.join(process.cwd(), 'llm/inspirations/presentations');

const wrapHtml = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        background: "var(--background)",
                        foreground: "var(--foreground)",
                        primary: "var(--primary)",
                        card: "var(--card)",
                        border: "var(--border)",
                        accent: "var(--accent)",
                        muted: {
                            DEFAULT: "var(--muted)",
                            foreground: "var(--muted-foreground)"
                        }
                    },
                    borderRadius: {
                        lg: "var(--radius)",
                        md: "calc(var(--radius) - 2px)",
                        sm: "calc(var(--radius) - 4px)"
                    }
                }
            }
        }
    </script>
    <style>
        :root {
            --background: ${theme.background};
            --foreground: ${theme.foreground};
            --primary: ${theme.primary};
            --card: ${theme.card};
            --border: ${theme.border};
            --accent: ${theme.accent};
            --muted: ${theme.muted};
            --muted-foreground: ${theme.mutedForeground};
            --radius: ${theme.radius};
        }
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          width: 1024px; 
          height: 576px; 
          background: var(--background); 
          color: var(--foreground); 
          font-family: sans-serif;
        }
        #preview-root {
          width: 1024px;
          height: 576px;
        }
    </style>
</head>
<body>
    <div id="preview-root">
        ${content.trim()}
    </div>
    <script>
        if (window.lucide) lucide.createIcons();
    </script>
</body>
</html>`;

const processDir = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('<!DOCTYPE html>')) {
        console.log(`Wrapping ${file} in ${path.basename(dir)}`);
        fs.writeFileSync(fullPath, wrapHtml(content), 'utf8');
      }
    }
  });
};

processDir(baseDir);
console.log('Done wrapping inspirations.');
