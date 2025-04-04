"use client";

import { config } from "@/config";
import React, { useEffect, useState } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up PDF.js worker to use local worker file
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ConvertFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  convertedUrl?: string;
  convertedSize?: number;
}

export default function Page() {
  const [file, setFile] = useState<ConvertFile | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.match(/image\/(jpeg|jpg)/)) {
      setError("Please select a JPG or JPEG image file");
      return;
    }

    const fileObj: ConvertFile = {
      id: `${selectedFile.name}-${Date.now()}`,
      name: selectedFile.name,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile),
      size: selectedFile.size,
    };

    setFile(fileObj);
    setCurrentPage(1);
    setError(null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
    setError(err.message);
  };

  // Cleanup URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.url);
        if (file.convertedUrl) {
          URL.revokeObjectURL(file.convertedUrl);
        }
      }
    };
  }, [file]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file.file);

      const response = await fetch(`${config.apiBaseUrl}/pdf/convert/jpg-to-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert file");
      }

      const blob = await response.blob();
      const convertedUrl = URL.createObjectURL(blob);
      const convertedSize = blob.size;

      setFile({
        ...file,
        convertedUrl,
        convertedSize,
      });
    } catch (err) {
      console.error("Error converting file:", err);
      setError(err instanceof Error ? err.message : "Failed to convert file");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!file?.convertedUrl) return;

    const link = document.createElement("a");
    link.href = file.convertedUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1">
            JPG to PDF Converter
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Convert your JPG images to PDF format with high quality and ease.
          </p>
        </div>

        {/* File Upload Section */}
        {!file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file-upload"
                className="w-full max-w-xl h-64 flex flex-col items-center justify-center border-3 border-dashed border-black rounded-none cursor-pointer bg-[#4DCCFF] hover:bg-[#7DDAFF] transition-colors duration-200 relative p-6"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">Drop your JPG here</p>
                  <p className="text-lg">or click to browse</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* File Info and Conversion Section */}
        {file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Selected File</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-gray-600">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Remove
                </button>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isConverting}
              className={`w-full py-4 px-6 text-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                isConverting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4DCCFF] hover:bg-[#7DDAFF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              }`}
            >
              {isConverting ? "Converting..." : "Convert to PDF"}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 border-2 border-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview and Download Section */}
        {file?.convertedUrl && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            <h2 className="text-2xl font-bold mb-4">Converted PDF</h2>
            <div className="mb-6">
              <p className="text-lg font-medium">Size: {formatFileSize(file.convertedSize || 0)}</p>
            </div>

            <div className="border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
              <Document
                file={file.convertedUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="flex justify-center"
              >
                <PdfPage
                  pageNumber={currentPage}
                  width={600}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 hover:bg-gray-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 hover:bg-gray-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Next
                </button>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-4 px-6 text-xl font-bold bg-green-500 hover:bg-green-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Download PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 