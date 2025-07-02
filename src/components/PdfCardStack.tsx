import React from "react";
import type { ProcessedPdf } from "../types.js";

interface PdfCardStackProps {
  pdfs: ProcessedPdf[];
}

export const PdfCardStack: React.FC<PdfCardStackProps> = ({ pdfs }) => {
  if (pdfs.length === 0) return null;

  // We want to show a limited number of cards in the stack for visual clarity
  const visiblePdfs = pdfs.slice(0, 5).reverse(); // Reverse so the first PDF is on top

  return (
    <div className="relative w-full h-48 flex items-center justify-center mb-6">
      {visiblePdfs.map((pdf, index) => {
        const isTopCard = index === visiblePdfs.length - 1;
        const zIndex = index;
        const scale = 1 - (visiblePdfs.length - 1 - index) * 0.05;
        const translateY = -10 + (visiblePdfs.length - 1 - index) * 12;
        const rotation = isTopCard
          ? 0
          : index * 4 -
            (visiblePdfs.length > 1 ? (visiblePdfs.length - 1) * 2 : 0);
        const previewUrl =
          pdf.pages.length > 0 ? pdf.pages[0].imageUrl : undefined;

        return (
          <div
            key={pdf.id}
            className="absolute transition-all duration-300 ease-out bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600 flex flex-col"
            style={{
              zIndex,
              transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
              width: "240px",
              height: "160px",
              boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex-grow bg-slate-800 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Preview of ${pdf.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 p-2 text-center">
                  Cargando...
                </div>
              )}
            </div>
            <div className="p-2 bg-slate-700/80 backdrop-blur-sm">
              <p className="text-xs text-slate-200 font-medium truncate">
                {pdf.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
