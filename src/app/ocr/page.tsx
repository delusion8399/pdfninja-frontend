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
  ocrUrl?: string;
  ocrSize?: number;
  language?: string;
  ocrBlob?: Blob;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<string>("eng");
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


  const handleOCR = async () => {
    if (!file) {
      alert("Please select a PDF to process.");
      return;
    }
  
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("pdf", file.file);
    formData.append("language", language);
  
    try {
      const response = await fetch(`${config.apiBaseUrl}/pdf/ocr`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "OCR processing failed"
        );
      }
  
      const blob = await response.blob();
      const ocrUrl = window.URL.createObjectURL(blob);
  
      setFile({
        ...file,
        ocrBlob: blob,
        ocrUrl: ocrUrl,
        ocrSize: blob.size,
        language: language,
      });
    } catch (error) {
      console.error("Error processing PDF with OCR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process PDF with OCR. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (!file || !file.ocrBlob) return;
  
    const ocrUrl = URL.createObjectURL(file.ocrBlob);
    const link = document.createElement("a");
    link.href = ocrUrl;
    link.download = `ocr_${file.name}`;
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    URL.revokeObjectURL(ocrUrl); // Clean up after download
  };
  
  // Adjusted useEffect for cleanup
  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.url);
        if (file.ocrUrl) {
          URL.revokeObjectURL(file.ocrUrl);
        }
      }
    };
  }, [file]);
 
  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1">
            OCR PDF Files
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Convert scanned PDFs into searchable documents with optical character recognition.
            Extract text from images and make your PDFs more accessible.
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
                  disabled={isProcessing}
                />
              </label>

              {/* Language Selection */}
              <div className="w-full max-w-xl mt-8">
                <h3 className="text-xl font-bold mb-4 text-black">
                  OCR Language
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLanguage("eng")}
                    className={
                      "p-4 border-3 border-black font-bold transition-all duration-200 " +
                      (language === "eng"
                        ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-black hover:bg-[#FFDE59]")
                    }
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("fra")}
                    className={
                      "p-4 border-3 border-black font-bold transition-all duration-200 " +
                      (language === "fra"
                        ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-black hover:bg-[#FFDE59]")
                    }
                  >
                    French
                  </button>
                  <button
                    onClick={() => setLanguage("deu")}
                    className={
                      "p-4 border-3 border-black font-bold transition-all duration-200 " +
                      (language === "deu"
                        ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-black hover:bg-[#FFDE59]")
                    }
                  >
                    German
                  </button>
                  <button
                    onClick={() => setLanguage("spa")}
                    className={
                      "p-4 border-3 border-black font-bold transition-all duration-200 " +
                      (language === "spa"
                        ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-black hover:bg-[#FFDE59]")
                    }
                  >
                    Spanish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview and Results Section */}
        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original PDF Preview */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <h2 className="text-2xl font-bold mb-4 text-black">Original PDF</h2>
              <div className="mb-4">
                <p className="text-lg font-medium">
                  <span className="font-bold">File:</span> {file.name}
                </p>
                <p className="text-lg font-medium">
                  <span className="font-bold">Size:</span> {formatFileSize(file.size)}
                </p>
                {file.numPages && (
                  <p className="text-lg font-medium">
                    <span className="font-bold">Pages:</span> {file.numPages}
                  </p>
                )}
              </div>

              <div className="border-3 border-black p-4 mb-4 bg-gray-100">
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
                  {file.numPages && (
                    <PdfPage
                      pageNumber={currentPage}
                      width={400}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  )}
                </Document>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-[#4DCCFF] text-black font-bold border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7DDAFF] transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <span className="font-bold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-[#4DCCFF] text-black font-bold border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7DDAFF] transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* OCR Results */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <h2 className="text-2xl font-bold mb-4 text-black">OCR Results</h2>

              {!file.ocrUrl ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <p className="text-xl font-medium mb-6 text-center">
                    Click the button below to process your PDF with OCR
                  </p>
                  <button
                    onClick={handleOCR}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-[#FF3A5E] text-white font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Process with OCR"
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-lg font-medium">
                      <span className="font-bold">File:</span> OCR_{file.name}
                    </p>
                    <p className="text-lg font-medium">
                      <span className="font-bold">Size:</span>{" "}
                      {formatFileSize(file.ocrSize || 0)}
                    </p>
                    <p className="text-lg font-medium">
                      <span className="font-bold">Language:</span>{" "}
                      {language === "eng"
                        ? "English"
                        : language === "fra"
                        ? "French"
                        : language === "deu"
                        ? "German"
                        : language === "spa"
                        ? "Spanish"
                        : language}
                    </p>
                  </div>

                  <div className="border-3 border-black p-4 mb-4 bg-gray-100">
                    <Document
                      file={file.ocrUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex justify-center items-center h-96">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                      }
                    >
                      {file.numPages && (
                        <PdfPage
                          pageNumber={currentPage}
                          width={400}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                      )}
                    </Document>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-[#4DCCFF] text-black font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                    >
                      Download OCR PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 bg-red-100 border-3 border-red-500 p-4 text-red-700">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Reset Button */}
        {file && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setFile(null)}
              className="px-6 py-3 bg-white text-black font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
            >
              Process Another PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 