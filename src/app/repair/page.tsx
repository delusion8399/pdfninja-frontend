"use client";

import React, { useEffect, useState } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { config } from "@/config";

// Set up PDF.js worker to use local worker file
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  numPages?: number;
  repairedUrl?: string;
  repairedSize?: number;
  repairWarning?: string;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileObj: PDFFile = {
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
    if (file) {
      setFile({
        ...file,
        numPages: numPages,
      });
    }
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
        if (file.repairedUrl) {
          URL.revokeObjectURL(file.repairedUrl);
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

  const handleRepair = async () => {
    if (!file) {
      alert("Please select a PDF to repair.");
      return;
    }

    setIsRepairing(true);
    const formData = new FormData();
    formData.append("pdf", file.file);

    try {
      const response = await fetch(`${config.apiBaseUrl}/pdf/repair`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Repair failed"
        );
      }

      const blob = await response.blob();
      const repairedUrl = window.URL.createObjectURL(blob);

      // Calculate repaired size from the blob
      const repairedSize = blob.size;

      // If the repaired file is larger, show a warning message
      let repairWarning: string | undefined = undefined;
      if (repairedSize > file.size) {
        repairWarning =
          "The repaired file is larger than the original. This is normal as the repair process may add additional metadata to ensure the PDF is valid.";
      }

      setFile({
        ...file,
        repairedUrl: repairedUrl,
        repairedSize: repairedSize,
        repairWarning: repairWarning,
      });
    } catch (error) {
      console.error("Error repairing PDF:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to repair PDF. Please try again."
      );
    } finally {
      setIsRepairing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !file.repairedUrl) return;

    const link = document.createElement("a");
    link.href = file.repairedUrl;
    link.download = `repaired_${file.name}`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1">
            Repair PDF Files
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Fix corrupted or damaged PDF files. Our repair tool can recover and restore your PDFs to a usable state.
          </p>
        </div>

        {/* File Upload Section - Only shown when no file is selected */}
        {!file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file-upload"
                className="w-full max-w-xl h-64 flex flex-col items-center justify-center border-3 border-dashed border-black rounded-none cursor-pointer bg-[#4DCCFF] hover:bg-[#7DDAFF] transition-colors duration-200 relative p-6"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-12 h-12 mb-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-xl font-bold text-black">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm font-medium text-black">
                    PDF file (MAX. 100MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isRepairing}
                />
              </label>

              <button
                onClick={handleRepair}
                disabled={!file || isRepairing}
                className={`mt-8 px-8 py-4 text-xl font-bold border-3 border-black transition-all duration-200 ${
                  !file || isRepairing
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#FF3A5E] text-white hover:bg-[#FF6B87] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                }`}
              >
                {isRepairing ? "Repairing..." : "Repair PDF"}
              </button>
            </div>
          </div>
        )}

        {/* PDF Preview and Results Section - Shown when a file is selected */}
        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PDF Preview */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <h2 className="text-2xl font-bold mb-4 text-black">Original PDF</h2>
              <div className="border-3 border-black p-4 bg-gray-100 mb-4">
                <p className="font-bold text-black">{file.name}</p>
                <p className="text-sm text-gray-700">
                  Size: {formatFileSize(file.size)}
                </p>
                {file.numPages && (
                  <p className="text-sm text-gray-700">
                    Pages: {file.numPages}
                  </p>
                )}
              </div>

              {error ? (
                <div className="border-3 border-red-500 p-4 bg-red-100 text-red-700 mb-4">
                  <p className="font-bold">Error loading PDF:</p>
                  <p>{error}</p>
                </div>
              ) : (
                <div className="border-3 border-black overflow-hidden">
                  <Document
                    file={file.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                      </div>
                    }
                  >
                    <PdfPage
                      pageNumber={currentPage}
                      width={400}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2 border-2 border-black font-bold text-black ${
                      currentPage <= 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white hover:bg-[#FFDE59]"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="font-bold text-black">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2 border-2 border-black font-bold text-black ${
                      currentPage >= totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white hover:bg-[#FFDE59]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Repair Results */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <h2 className="text-2xl font-bold mb-4 text-black">Repair Results</h2>

              {!file.repairedUrl ? (
                <div className="flex flex-col items-center justify-center h-64 border-3 border-dashed border-black bg-gray-100">
                  <p className="text-xl font-bold text-black mb-4">
                    {isRepairing ? "Repairing your PDF..." : "Ready to repair"}
                  </p>
                  {isRepairing ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                  ) : (
                    <button
                      onClick={handleRepair}
                      disabled={isRepairing}
                      className="px-6 py-3 bg-[#FF3A5E] text-white font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                    >
                      Repair PDF
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="border-3 border-black p-4 bg-gray-100 mb-4">
                    <p className="font-bold text-black">
                      Repaired: repaired_{file.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      Original Size: {formatFileSize(file.size)}
                    </p>
                    <p className="text-sm text-gray-700">
                      Repaired Size: {formatFileSize(file.repairedSize || 0)}
                    </p>
                    {file.repairWarning && (
                      <div className="mt-2 p-2 bg-yellow-100 border-2 border-yellow-500 text-yellow-800">
                        <p className="text-sm font-medium">{file.repairWarning}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-3 border-black overflow-hidden mb-4">
                    <Document
                      file={file.repairedUrl}
                      loading={
                        <div className="flex justify-center items-center h-96">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                      }
                    >
                      <PdfPage
                        pageNumber={1}
                        width={400}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-[#4DCCFF] text-black font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                    >
                      Download Repaired PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Try Another File Button */}
        {file && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setFile(null)}
              className="px-6 py-3 bg-white text-black font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
            >
              Try Another File
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 