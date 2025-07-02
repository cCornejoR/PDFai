import React from "react";
import type { ProcessedPdf } from "../types.js";
import { Spinner } from "./Spinner.js";
import { Trash2 } from "lucide-react";

interface PdfPreviewCardProps {
  pdf: ProcessedPdf;
  onRemove: (id: string) => void;
}

export const PdfPreviewCard: React.FC<PdfPreviewCardProps> = ({
  pdf,
  onRemove,
}) => {
  const previewUrl = pdf.pages.length > 0 ? pdf.pages[0].imageUrl : undefined;

  return (
    <div className="bg-slate-700/50 rounded-lg shadow-lg overflow-hidden flex flex-col border border-slate-600">
      <div className="relative h-48 bg-slate-800 flex items-center justify-center">
        {pdf.status === "processing" && (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Spinner />
            <span>Procesando...</span>
          </div>
        )}
        {pdf.status === "error" && (
          <div className="p-2 text-center text-red-300">
            <p className="font-semibold text-sm">Error</p>
            <p className="text-xs">{pdf.error}</p>
          </div>
        )}
        {pdf.status === "ready" && previewUrl && (
          <img
            src={previewUrl}
            alt={`Preview of ${pdf.name}`}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div className="p-3 bg-slate-700 flex-1 flex flex-col justify-between">
        <p className="text-sm text-slate-200 font-medium break-all">
          {pdf.name}
        </p>
        <button
          onClick={() => onRemove(pdf.id)}
          className="mt-2 text-slate-400 hover:text-red-400 self-end p-1"
          aria-label={`Remove ${pdf.name}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
