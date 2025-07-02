import type { PageData } from "../types.js";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - use local worker to avoid CORS issues
// In Tauri environment, we need to ensure the worker loads correctly
if (typeof window !== "undefined") {
  // For browser/Tauri environment
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} else {
  // Fallback for other environments
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "pdfjs-dist/build/pdf.worker.min.mjs";
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
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pagesData: PageData[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // Extract text content
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter((item: any) => item.str)
      .map((item: any) => item.str)
      .join(" ");

    // Generate image preview for the page
    const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better quality
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo obtener el contexto del canvas.");
    }
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    const imageUrl = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG for smaller size

    pagesData.push({ text: pageText, imageUrl });
  }

  return { pages: pagesData };
};
