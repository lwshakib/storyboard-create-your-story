"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SlidePreviewProps {
  html: string
  className?: string
  scale?: number
  autoScale?: boolean
  isEditable?: boolean
}

export function SlidePreview({
  html,
  className,
  scale,
  autoScale = false,
  isEditable = false,
}: SlidePreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [computedScale, setComputedScale] = React.useState(scale || 1)

  React.useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: "SET_EDIT_MODE",
          enabled: isEditable,
        },
        "*"
      )
    }
  }, [isEditable])

  // Also send it when iframe loads
  const handleLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: "SET_EDIT_MODE",
          enabled: isEditable,
        },
        "*"
      )
    }
  }

  React.useEffect(() => {
    if (!autoScale || scale) return

    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        const styles = window.getComputedStyle(containerRef.current)

        // Subtract border and padding for exact content fit
        const borderX =
          parseFloat(styles.borderLeftWidth) +
            parseFloat(styles.borderRightWidth) || 0
        const borderY =
          parseFloat(styles.borderTopWidth) +
            parseFloat(styles.borderBottomWidth) || 0
        const paddingX =
          parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight) || 0
        const paddingY =
          parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom) || 0

        const contentWidth = width - borderX - paddingX
        const contentHeight = height - borderY - paddingY

        // Calculate scale to fit our base resolution (960x540)
        const scaleW = contentWidth / 960
        const scaleH = contentHeight / 540

        // Use the smaller scale to ensure it fits entirely (contain strategy)
        // Adding a tiny buffer (0.001) to ensure sub-pixel rounding doesn't leave gaps
        const newScale = Math.min(scaleW, scaleH)
        if (newScale > 0) {
          setComputedScale(newScale)
        }
      }
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) observer.observe(containerRef.current)

    window.addEventListener("resize", updateScale)
    return () => {
      window.removeEventListener("resize", updateScale)
      observer.disconnect()
    }
  }, [autoScale, scale])

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
        #preview-root { 
          min-height: 100%; 
          position: relative; 
          width: 960px;
          height: 540px;
          margin: 0;
        }
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

          if (e.type === 'click' || e.type === 'dblclick') {
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
            if (!target.id) target.id = 'el-' + Math.random().toString(36).substr(2, 9);
            window.parent.postMessage({
              type: 'ELEMENT_CLICKED',
              elementId: target.id,
              tagName: target.tagName,
              content: target.innerText,
              styles: styles
            }, '*');
          }

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
                if (key === 'innerText') el.innerText = value;
                else el.style[key] = value;
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
      let fullHtml = html
      if (fullHtml.includes("</head>")) {
        fullHtml = fullHtml.replace("</head>", `${editorStyles}</head>`)
      }
      if (fullHtml.includes("</body>")) {
        fullHtml = fullHtml.replace("</body>", `${editorScripts}</body>`)
      } else {
        fullHtml += editorScripts
      }
      return fullHtml
    }

    return `
      <html style="margin: 0; padding: 0; overflow: hidden !important; height: 100%;">
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
              overflow: hidden !important; 
              background: transparent; 
              width: 960px; 
              height: 540px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            body::-webkit-scrollbar { display: none; }
            * { box-sizing: border-box; }
          </style>
          ${editorStyles}
          ${editorScripts}
        </head>
        <body data-edit-mode="false">
          <div id="preview-root" class="relative overflow-hidden w-full h-full">
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
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: "960px",
          height: "540px",
          transform: `scale(${scale || computedScale})`,
          transformOrigin: "center center",
          transition: "transform 0.1s ease-out",
        }}
      >
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          onLoad={handleLoad}
          className={cn(
            "h-[540px] w-[960px] overflow-hidden border-none bg-transparent shadow-none",
            !isEditable && "pointer-events-none"
          )}
          scrolling="no"
          title="Slide Preview"
        />
      </div>
    </div>
  )
}
