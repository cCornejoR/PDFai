import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface PdfUploadProps {
  onPdfSelected: (files: File[]) => void;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({ onPdfSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(
        (file) => file.type === "application/pdf"
      );
      if (pdfFiles.length > 0) {
        onPdfSelected(pdfFiles);
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files) {
        const pdfFiles = Array.from(files).filter(
          (file) => file.type === "application/pdf"
        );
        if (pdfFiles.length > 0) {
          onPdfSelected(pdfFiles);
        }
      }
    },
    [onPdfSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bricolage-semibold text-slate-100 mb-2">
        Sube tus documentos PDF
      </h2>
      <p className="text-slate-400 mb-6 text-center font-bricolage-normal">
        Arrastra y suelta uno o más archivos.
      </p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`w-full p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragging
            ? "border-sky-400 bg-sky-900/50"
            : "border-slate-600 hover:border-sky-500 hover:bg-slate-700/50"
        }`}
      >
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer text-center flex flex-col items-center"
        >
          <Upload
            className={`w-16 h-16 mb-4 transition-colors ${
              isDragging ? "text-sky-300" : "text-slate-500"
            }`}
          />
          <span
            className={`font-bricolage-semibold transition-colors ${
              isDragging ? "text-sky-300" : "text-sky-500"
            }`}
          >
            Seleccionar archivos
          </span>
          <p className="text-sm text-slate-400 mt-2 font-bricolage-normal">
            O arrástralos y suéltalos aquí
          </p>
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );
};
