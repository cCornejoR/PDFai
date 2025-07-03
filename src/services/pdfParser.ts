import type { PageData } from "../types.js";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - use local worker to avoid CORS issues
// In Tauri environment, we need to ensure the worker loads correctly
if (typeof window !== "undefined") {
  try {
    // For browser/Tauri environment - try different worker paths
    const workerPaths = [
      new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString(),
      "/node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
      "https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs",
    ];

    // Use the first available worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPaths[0];
    console.log(
      "✅ PDF.js worker configurado:",
      pdfjsLib.GlobalWorkerOptions.workerSrc
    );
  } catch (error) {
    console.warn("⚠️ Error configurando PDF.js worker:", error);
    // Fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs";
  }
} else {
  // Fallback for other environments
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs";
}

interface ProcessResult {
  pages: PageData[];
}

/**
 * Extracts text and generates an image for each page of a PDF file.
 * @param file The PDF file object.
 * @returns A promise that resolves to an object containing an array of page data.
 */
export const processPdf = async (file: File): Promise<ProcessResult> => {
  try {
    console.log(`🔄 Iniciando procesamiento de PDF: ${file.name}`);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      // Configuraciones adicionales para mejor compatibilidad
      verbosity: 0, // Reducir logs de PDF.js
      cMapUrl: "https://unpkg.com/pdfjs-dist@5.3.31/cmaps/",
      cMapPacked: true,
    }).promise;

    const pagesData: PageData[] = [];
    console.log(`📄 PDF cargado exitosamente. Páginas: ${pdf.numPages}`);

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`🔄 Procesando página ${i}/${pdf.numPages}`);

      const page = await pdf.getPage(i);

      // Extract text content with better error handling
      let pageText = "";
      try {
        const textContent = await page.getTextContent();
        pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str.trim())
          .join(" ")
          .replace(/\s+/g, " ") // Normalizar espacios
          .trim();
      } catch (textError) {
        console.warn(`⚠️ Error extrayendo texto de página ${i}:`, textError);
        pageText = `[Error extrayendo texto de página ${i}]`;
      }

      // Generate image preview for the page with better quality
      let imageUrl = "";
      try {
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("No se pudo obtener el contexto del canvas.");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          intent: "display", // Optimizar para visualización
        }).promise;

        imageUrl = canvas.toDataURL("image/jpeg", 0.9); // Higher quality
        console.log(`✅ Página ${i} procesada exitosamente`);
      } catch (imageError) {
        console.warn(`⚠️ Error generando imagen de página ${i}:`, imageError);
        // Crear una imagen placeholder en caso de error
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 800;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "#f0f0f0";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "#666";
          context.font = "20px Arial";
          context.textAlign = "center";
          context.fillText(
            `Error cargando página ${i}`,
            canvas.width / 2,
            canvas.height / 2
          );
        }
        imageUrl = canvas.toDataURL("image/jpeg", 0.8);
      }

      pagesData.push({ text: pageText, imageUrl });
    }

    console.log(`✅ PDF procesado exitosamente: ${pagesData.length} páginas`);
    return { pages: pagesData };
  } catch (error) {
    console.error("❌ Error procesando PDF:", error);
    throw new Error(
      `Error procesando PDF: ${error instanceof Error ? error.message : "Error desconocido"}`
    );
  }
};
