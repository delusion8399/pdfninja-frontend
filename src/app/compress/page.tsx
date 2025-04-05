"use client";

import Link from "next/link";
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
  compressedUrl?: string;
  compressedSize?: number;
  compressionWarning?: string;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<string>("medium");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    if (file) {
      setFile({
        ...file,
        numPages: numPages,
      });
    }
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
  };

  // Cleanup URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.url);
        if (file.compressedUrl) {
          URL.revokeObjectURL(file.compressedUrl);
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

  const handleCompress = async () => {
    if (!file) {
      alert("Please select a PDF to compress.");
      return;
    }

    setIsCompressing(true);
    const formData = new FormData();
    formData.append("pdf", file.file);
    formData.append("quality", compressionLevel);

    try {
      const response = await fetch(`${config.apiBaseUrl}/pdf/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Compression failed"
        );
      }

      const blob = await response.blob();
      const compressedUrl = window.URL.createObjectURL(blob);

      // Calculate compressed size from the blob
      const compressedSize = blob.size;

      const reductionPercent = Math.round(
        (1 - compressedSize / file.size) * 100
      );

      // If the compression is less than 5%, show a warning message
      let compressionWarning: string | undefined = undefined;
      if (reductionPercent < 5) {
        compressionWarning =
          "This PDF contains mostly text or is already optimized, resulting in minimal compression.";
      } else if (
        reductionPercent >= 5 &&
        reductionPercent < 15 &&
        compressionLevel === "high"
      ) {
        compressionWarning =
          "Try Medium or Low quality for greater size reduction if image quality is less important.";
      } else if (reductionPercent >= 50 && compressionLevel === "low") {
        compressionWarning =
          "Significant compression achieved! Check that the image quality meets your needs.";
      }

      setFile({
        ...file,
        compressedUrl: compressedUrl,
        compressedSize: compressedSize,
        compressionWarning: compressionWarning,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to compress PDF. Please try again."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !file.compressedUrl) return;

    const link = document.createElement("a");
    link.href = file.compressedUrl;
    link.download = `compressed_${file.name}`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-0 hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
            Compress PDF Files
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium transform hover:scale-105 transition-transform duration-300">
            Reduce your PDF file size without losing quality. Perfect for
            sharing via email or saving storage space.
          </p>
        </div>

        {/* File Upload Section - Only shown when no file is selected */}
        {!file && (
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1 hover:rotate-0 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file-upload"
                className="w-full max-w-xl h-64 flex flex-col items-center justify-center border-3 border-dashed border-black rounded-none cursor-pointer bg-[#4DCCFF] hover:bg-[#7DDAFF] transition-all duration-300 relative p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-12 h-12 mb-4 text-black transform hover:scale-110 transition-transform duration-300"
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
                  <p className="mb-2 text-xl font-black text-black transform hover:scale-105 transition-transform duration-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm font-black text-black transform hover:scale-105 transition-transform duration-300">
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
                  disabled={isCompressing}
                />
              </label>

              {/* Compression Options */}
              <div className="w-full max-w-xl mt-8">
                <h3 className="text-xl font-black mb-4 text-black transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
                  Compression Level
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setCompressionLevel("low")}
                    className={`p-4 border-3 border-black font-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 ${
                      compressionLevel === "low"
                        ? "bg-[#FF3A5E] text-white"
                        : "bg-white text-black hover:bg-[#FFDE59]"
                    }`}
                  >
                    Low Quality
                    <span className="block text-sm mt-1 font-black">
                      Maximum compression
                    </span>
                  </button>
                  <button
                    onClick={() => setCompressionLevel("medium")}
                    className={`p-4 border-3 border-black font-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 ${
                      compressionLevel === "medium"
                        ? "bg-[#FF3A5E] text-white"
                        : "bg-white text-black hover:bg-[#FFDE59]"
                    }`}
                  >
                    Medium Quality
                    <span className="block text-sm mt-1 font-black">
                      Balanced
                    </span>
                  </button>
                  <button
                    onClick={() => setCompressionLevel("high")}
                    className={`p-4 border-3 border-black font-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 ${
                      compressionLevel === "high"
                        ? "bg-[#FF3A5E] text-white"
                        : "bg-white text-black hover:bg-[#FFDE59]"
                    }`}
                  >
                    High Quality
                    <span className="block text-sm mt-1 font-black">
                      Minimum compression
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview and Compression Results */}
        {file && (
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-0 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PDF Preview */}
              <div className="border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-black mb-4 text-black transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
                  Preview
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className={`bg-[#FF3A5E] text-white px-4 py-2 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 ${
                      currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-black font-bold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className={`bg-[#FF3A5E] text-white px-4 py-2 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 ${
                      currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="border-2 border-black p-2">
                  <Document
                    file={file.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex justify-center items-center h-64">
                        <span className="text-black font-bold">Loading...</span>
                      </div>
                    }
                  >
                    <PdfPage
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
              </div>

              {/* Compression Results */}
              <div className="border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-black mb-4 text-black transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
                  Compression Results
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-bold">Original Size:</span>
                    <span className="text-black font-bold">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  {file.compressedUrl && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-black font-bold">
                          Compressed Size:
                        </span>
                        <span className="text-black font-bold">
                          {formatFileSize(file.compressedSize || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black font-bold">
                          Size Reduction:
                        </span>
                        <span className="text-black font-bold">
                          {Math.round(
                            (1 - (file.compressedSize || 0) / file.size) * 100
                          )}
                          %
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {file.compressionWarning && (
                  <div className="mt-4 p-4 bg-[#FFDE59] border-3 border-black">
                    <p className="text-black font-bold">{file.compressionWarning}</p>
                  </div>
                )}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleCompress}
                    disabled={isCompressing}
                    className={`bg-[#FF3A5E] text-white px-8 py-4 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 ${
                      isCompressing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isCompressing ? "Compressing..." : "Compress PDF"}
                  </button>
                </div>
                {file.compressedUrl && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="bg-[#4DCCFF] text-black px-8 py-4 border-3 border-black font-bold hover:bg-[#7DDAFF] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105"
                    >
                      Download Compressed PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
          <h2 className="text-3xl font-black text-black mb-6 tracking-tight transform -rotate-1">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#4DCCFF] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Upload Your PDF
              </h3>
              <p className="text-black">
                Select the PDF file you want to compress from your device.
              </p>
            </div>
            <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Choose Compression Level
              </h3>
              <p className="text-black">
                Select your preferred compression level. Lower quality gives
                smaller files but may reduce image clarity. Higher quality
                preserves details with less compression.
              </p>
            </div>
            <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Download Compressed File
              </h3>
              <p className="text-black">
                Get your optimized PDF with reduced file size ready to share.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-xl font-black text-black transform -rotate-2">
                PDFNinja
              </p>
              <p className="text-sm text-black">
                © {new Date().getFullYear()} PDFNinja. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-black hover:text-[#FF3A5E]">
                Privacy Policy
              </Link>
              <Link href="/" className="text-black hover:text-[#FF3A5E]">
                Terms of Service
              </Link>
              <Link href="/" className="text-black hover:text-[#FF3A5E]">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
