"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AdvancedSlidePreviewProps {
  html: string
  className?: string
  scale?: number
  autoScale?: boolean
  isEditable?: boolean
}

export function AdvancedSlidePreview({ 
  html, 
  className, 
  scale, 
  autoScale = false,
  isEditable = false
}: AdvancedSlidePreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [computedScale, setComputedScale] = React.useState(scale || 1)

  React.useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'SET_EDIT_MODE',
        enabled: isEditable
      }, '*');
    }
  }, [isEditable]);
  
  // Also send it when iframe loads
  const handleLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'SET_EDIT_MODE',
        enabled: isEditable
      }, '*');
    }
  };

  React.useEffect(() => {
    if (!autoScale || scale) return

    const updateScale = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setComputedScale(width / 1024)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [autoScale, scale])

  // Use a stable key for the iframe to prevent unnecessary reloads, 
  // but we update the srcDoc when html changes.
  const srcDoc = React.useMemo(() => {
    const isFullDoc = /<html/i.test(html)
    
    const editorStyles = `
      <style>
        .edit-hover-highlight {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: -1px !important;
          cursor: pointer !important;
        }
        .edit-selected-highlight {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -1px !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4) !important;
        }
        .editing-active {
          outline: 3px solid #3b82f6 !important;
          background: rgba(59, 130, 246, 0.05) !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6) !important;
          z-index: 1000 !important;
          position: relative !important;
        }
        /* Ensure the preview root is measurable */
        #preview-root { min-height: 100%; position: relative; }
      </style>
    `

    const editorScripts = `
      <script>
        window.addEventListener('message', (e) => {
          if (e.data.type === 'SET_EDIT_MODE') {
            document.body.dataset.editMode = e.data.enabled;
          }
        });

        document.addEventListener('mouseover', (e) => {
          if (document.body.dataset.editMode !== 'true') return;
          const target = e.target.closest('*');
          if (target && target !== document.body && target !== document.documentElement) {
            target.classList.add('edit-hover-highlight');
          }
        });

        document.addEventListener('mouseout', (e) => {
          const target = e.target.closest('*');
          if (target) {
            target.classList.remove('edit-hover-highlight');
          }
        });

        const handleElementInteraction = (e) => {
          if (document.body.dataset.editMode !== 'true') return;
          
          const target = e.target.closest('*');
          if (!target || target === document.body || target === document.documentElement) return;

          // Always notify parent of the click
          if (e.type === 'click' || e.type === 'dblclick') {
            // Clear previous selection
            document.querySelectorAll('.edit-selected-highlight').forEach(el => el.classList.remove('edit-selected-highlight'));
            target.classList.add('edit-selected-highlight');

            const computed = window.getComputedStyle(target);
            const styles = {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontFamily: computed.fontFamily,
              textAlign: computed.textAlign,
              padding: computed.padding,
              margin: computed.margin,
              borderRadius: computed.borderRadius,
            };

            if (!target.id) {
              target.id = 'el-' + Math.random().toString(36).substr(2, 9);
            }

            window.parent.postMessage({
              type: 'ELEMENT_CLICKED',
              elementId: target.id,
              tagName: target.tagName,
              content: target.innerText,
              styles: styles
            }, '*');
          }

          // Handle double-click for in-place editing
          if (e.type === 'dblclick') {
            const isText = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'LI', 'B', 'I', 'STRONG', 'EM'].includes(target.tagName);
            if (isText && target.children.length === 0) {
              e.preventDefault();
              e.stopPropagation();
              
              target.contentEditable = 'true';
              target.focus();
              target.classList.add('editing-active');
              
              const onBlur = () => {
                target.contentEditable = 'false';
                target.classList.remove('editing-active');
                target.removeEventListener('blur', onBlur);
                
                // Notify parent of the update
                window.parent.postMessage({
                  type: 'HTML_UPDATED',
                  html: document.getElementById('preview-root')?.innerHTML || document.body.innerHTML
                }, '*');
              };
              
              target.addEventListener('blur', onBlur);
            }
          }
        };

        document.addEventListener('click', handleElementInteraction);
        document.addEventListener('dblclick', handleElementInteraction);

        window.addEventListener('message', (e) => {
          if (e.data.type === 'UPDATE_ELEMENT') {
            const { elementId, changes } = e.data;
            const el = document.getElementById(elementId);
            if (el) {
              Object.entries(changes).forEach(([key, value]) => {
                if (key === 'innerText') {
                  el.innerText = value;
                } else {
                  el.style[key] = value;
                }
              });
              
              if (window.lucide) lucide.createIcons();

              window.parent.postMessage({
                type: 'HTML_UPDATED',
                html: document.getElementById('preview-root')?.innerHTML || document.body.innerHTML
              }, '*');
            }
          }
        });
      </script>
    `

    if (isFullDoc) {
      // Inject scripts into the full document
      let fullHtml = html
      if (fullHtml.includes('</head>')) {
        fullHtml = fullHtml.replace('</head>', `${editorStyles}</head>`)
      }
      if (fullHtml.includes('</body>')) {
        fullHtml = fullHtml.replace('</body>', `${editorScripts}</body>`)
      } else {
        fullHtml += editorScripts
      }
      return fullHtml
    }

    // Default fragment wrapping logic
    return `
      <!DOCTYPE html>
      <html style="margin: 0; padding: 0; overflow: hidden; height: 100%;">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/lucide@latest"></script>
          <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              overflow: hidden; 
              background: white; 
              width: 1024px; 
              height: 576px;
              position: relative;
            }
            * { box-sizing: border-box; }
          </style>
          ${editorStyles}
          ${editorScripts}
        </head>
        <body data-edit-mode="false">
          <div id="preview-root" class="w-[1024px] h-[576px] relative overflow-hidden">
            ${html}
          </div>
          <script>
             if (window.lucide) {
               lucide.createIcons();
             }
          </script>
        </body>
      </html>
    `
  }, [html])

  return (
    <div 
      ref={containerRef} 
      className={cn("w-full h-full overflow-hidden relative", className)}
    >
      <div 
        className="absolute top-0 left-0 origin-top-left flex items-center justify-center bg-white"
        style={{ 
          width: '1024px', 
          height: '576px', 
          transform: `scale(${scale || computedScale})`,
        }}
      >
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          onLoad={handleLoad}
          className={cn(
            "w-[1024px] h-[576px] border-none",
            !isEditable && "pointer-events-none"
          )}
          title="Slide Preview"
        />
      </div>
    </div>
  )
}
