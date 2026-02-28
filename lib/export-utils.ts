import pptxgen from "pptxgenjs";
import { Slide, SlideElement } from "@/types/editor";
import { HtmlSlide, htmlToStructuredSlide } from "./storyboard-parser";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { colorToHex } from "./utils";

export const exportToJson = (title: string, slides: Slide[]) => {
  const data = {
    title,
    slides,
    exportedAt: new Date().toISOString(),
    version: "1.0"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPpptx = async (title: string, slides: Slide[]) => {
  const pres = new pptxgen();
  pres.title = title;

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    
    // Set background color
    if (slideData.bgColor) {
      slide.background = { fill: slideData.bgColor.replace('#', '') };
    }

    // Since we don't have easy access to the images as blobs here (they are URLs),
    // and pptxgenjs supports URLs, we can use them directly.
    if (slideData.bgImage) {
        slide.background = { path: slideData.bgImage };
    }

    slideData.elements.forEach((el: SlideElement) => {
      // 1024x576 is our internal canvas size. 
      // Powerpoint default is usually 10x5.625 inches (16:9).
      const x: any = (el.x / 1024) * 100 + "%";
      const y: any = (el.y / 576) * 100 + "%";
      const w: any = (el.width / 1024) * 100 + "%";
      const h: any = (el.height / 576) * 100 + "%";

      if (el.type === "text") {
        slide.addText(el.content as string, {
          x, y, w, h,
          fontSize: el.fontSize ? el.fontSize * 0.75 : 18, // Adjust font size for PPT
          color: el.color?.replace('#', '') || "000000",
          align: el.textAlign as any || "left",
          fontFace: el.fontFamily || "Arial",
          bold: el.fontWeight === "900" || el.fontWeight === "bold",
          valign: "middle"
        });
      } else if (el.type === "image" && el.src && el.src !== "loading") {
        slide.addImage({
          path: el.src,
          x, y, w, h
        });
      } else if (el.type === "shape" && el.shapeType) {
          const shapeType = el.shapeType === 'circle' ? pres.ShapeType.ellipse : pres.ShapeType.rect;
          slide.addShape(shapeType, {
              x, y, w, h,
              fill: { color: el.color?.replace('#', '') || "CCCCCC", alpha: (el.opacity || 1) * 100 },
          });
      } else if (el.type === "table" && el.tableData) {
          const rows = el.tableData.map(row => row.map(cell => cell.text));
          slide.addTable(rows as any, {
              x, y, w, h,
              border: { pt: 1, color: "000000" },
              fill: { color: "F8F8F8" },
              fontSize: 12
          });
      } else if (['bar-chart', 'pie-chart', 'line-chart', 'area-chart', 'radar-chart', 'radial-chart'].includes(el.type) && el.chartData) {
          const labels = el.chartData.map(d => d.label);
          const values = el.chartData.map(d => d.value);
          const colors = el.chartData.map(d => d.color?.replace('#', '') || "3b82f6");

          let chartType: any = pres.ChartType.bar;
          if (el.type === 'pie-chart' || el.type === 'radial-chart') chartType = pres.ChartType.pie;
          if (el.type === 'line-chart') chartType = pres.ChartType.line;
          if (el.type === 'area-chart') chartType = pres.ChartType.area;
          if (el.type === 'radar-chart') chartType = pres.ChartType.radar;

          slide.addChart(chartType, [{ name: el.chartTitle || 'Data', labels, values }], {
              x, y, w, h,
              showTitle: !!el.chartTitle,
              title: el.chartTitle,
              chartColors: colors
          });
      }
    });
  });

  await pres.writeFile({ fileName: `${title.replace(/\s+/g, "_")}.pptx` });
};

// --- HTML Storyboard Exports ---

export const exportHtmlToJson = (title: string, description: string, slides: HtmlSlide[]) => {
    const data = {
        title,
        projectTitle: title,
        description,
        projectDescription: description,
        slides,
        exportedAt: new Date().toISOString(),
        format: "html-storyboard",
        version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_")}_advanced.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Obsolete capture function removed in favor of structural parsing


export const exportHtmlToPdf = async (title: string, slides: HtmlSlide[]) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [1024, 576]
    });

    const structuredSlides = await Promise.all(slides.map(s => htmlToStructuredSlide(s)));

    for (let i = 0; i < structuredSlides.length; i++) {
        if (i > 0) doc.addPage([1024, 576], "landscape");
        const slide = structuredSlides[i];
        
        // Background
        if (slide.bgColor) {
            const hex = colorToHex(slide.bgColor);
            if (hex.startsWith('#')) {
                doc.setFillColor(hex);
                doc.rect(0, 0, 1024, 576, 'F');
            }
        }

        for (const el of slide.elements) {
            if (el.type === 'text') {
                const hex = colorToHex(el.color || '#000000');
                if (hex.startsWith('#')) doc.setTextColor(hex);
                doc.setFontSize(el.fontSize || 24);
                // Simple text placement. y + fontSize is a rough baseline.
                doc.text(el.content, el.x, el.y + (el.fontSize || 24)); 
            } else if (el.type === 'image' && el.src) {
                try {
                    doc.addImage(el.src, 'PNG', el.x, el.y, el.width, el.height);
                } catch (e) {
                    console.warn("Failed to add image to PDF", e);
                }
            } else if (el.type === 'shape' && el.color) {
                const hex = colorToHex(el.color);
                if (hex.startsWith('#')) {
                    doc.setFillColor(hex);
                    if (el.shapeType === 'circle') {
                        doc.ellipse(el.x + el.width/2, el.y + el.height/2, el.width/2, el.height/2, 'F');
                    } else {
                        doc.rect(el.x, el.y, el.width, el.height, 'F');
                    }
                }
            }
        }
    }

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};

export const exportHtmlToPpptx = async (title: string, slides: HtmlSlide[]) => {
    const structuredSlides = await Promise.all(slides.map(s => htmlToStructuredSlide(s)));
    await exportToPpptx(title, structuredSlides);
};

export const exportImagesToPdf = async (title: string, images: string[]) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [1024, 576]
    });

    for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage([1024, 576], "landscape");
        doc.addImage(images[i], 'PNG', 0, 0, 1024, 576);
    }

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};

export const exportImagesToPpptx = async (title: string, images: string[]) => {
    const pres = new pptxgen();
    pres.title = title;

    images.forEach((imgData, idx) => {
        const slide = pres.addSlide();
        slide.addImage({
            data: imgData,
            x: 0, y: 0, w: "100%", h: "100%"
        });
    });

    await pres.writeFile({ fileName: `${title.replace(/\s+/g, "_")}.pptx` });
};
