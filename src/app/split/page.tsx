"use client";

import { config } from "@/config";
import React, { useEffect, useState } from "react";
import { Document, Page as PDFPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  numPages?: number;
  selectedPages: number[];
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
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
      selectedPages: [],
    };

    setFile(fileObj);
    setCurrentPage(1);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setError(null);
    if (file) {
      setFile((prev) => ({
        ...prev!,
        selectedPages: [],
      }));
    }
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
    setError(err.message);
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (file?.url) {
        URL.revokeObjectURL(file.url);
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

  const togglePageSelection = (pageNum: number) => {
    if (!file) return;

    setFile((prevFile) => {
      if (!prevFile) return null;

      const selectedPages = [...prevFile.selectedPages];
      const pageIndex = selectedPages.indexOf(pageNum);

      if (pageIndex === -1) {
        selectedPages.push(pageNum);
        selectedPages.sort((a, b) => a - b);
      } else {
        selectedPages.splice(pageIndex, 1);
      }

      return {
        ...prevFile,
        selectedPages,
      };
    });
  };

  const handleSelectAll = () => {
    if (!file || !totalPages) return;

    setFile((prevFile) => {
      if (!prevFile) return null;

      const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
      return {
        ...prevFile,
        selectedPages: allPages,
      };
    });
  };

  const handleDeselectAll = () => {
    if (!file) return;

    setFile((prevFile) => {
      if (!prevFile) return null;

      return {
        ...prevFile,
        selectedPages: [],
      };
    });
  };

  const handleSplit = async () => {
    if (!file || file.selectedPages.length === 0) {
      alert("Please select at least one page to extract.");
      return;
    }

    setIsSplitting(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file.file);
      formData.append("pagesToSplit", JSON.stringify(file.selectedPages));

      const response = await fetch(`${config.apiBaseUrl}/pdf/split`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to split PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}_split.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to split PDF. Please try again."
      );
    } finally {
      setIsSplitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!file && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
              <h1 className="text-4xl font-black text-black mb-4 tracking-tight">
                Split PDF Files
              </h1>
              <p className="text-xl text-black mb-8 font-medium">
                Extract specific pages from your PDF with our easy-to-use PDF
                splitter.
              </p>
              <label
                htmlFor="pdf-upload"
                className="bg-[#FF3A5E] text-white px-8 py-4 border-3 border-black font-bold cursor-pointer hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] inline-block"
              >
                Select PDF file
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-black mt-4 font-bold">or drop PDF here</p>
              <div className="absolute -top-6 -right-6 bg-[#4DCCFF] border-3 border-black p-3 transform rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xl font-black">FREE</span>
              </div>
            </div>
          </div>
        )}

        {file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PDF Preview */}
              <div className="border-3 border-black p-4">
                <h3 className="text-xl font-bold mb-4 text-black">
                  PDF Preview
                </h3>
                <div className="flex justify-center items-center bg-gray-100 border-2 border-black min-h-[400px] relative">
                  <Document
                    file={file.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center h-full w-full">
                        <div className="text-black font-bold">Loading...</div>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-full w-full">
                        <div className="text-black font-bold">
                          {error || "Error loading PDF"}
                        </div>
                      </div>
                    }
                    className="flex items-center justify-center w-full h-full"
                  >
                    <PDFPage
                      pageNumber={currentPage}
                      width={400}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="max-w-full h-auto object-contain"
                    />
                  </Document>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className={`bg-[#4DCCFF] text-black px-4 py-2 border-2 border-black font-bold ${
                      currentPage <= 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#7DDAFF] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
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
                    className={`bg-[#4DCCFF] text-black px-4 py-2 border-2 border-black font-bold ${
                      currentPage >= totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#7DDAFF] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="mt-4">
                  <p className="font-bold text-black">{file.name}</p>
                  <p className="text-black">
                    Size: {formatFileSize(file.file.size)}
                  </p>
                </div>
              </div>

              {/* Page Selection */}
              <div className="border-3 border-black p-4">
                <h3 className="text-xl font-bold mb-4 text-black">
                  Select Pages to Split
                </h3>
                <div className="bg-[#FFDE59] border-2 border-black p-4 mb-4">
                  <p className="text-black font-medium">
                    Click on the page numbers below to select which pages you
                    want to split into separate PDFs.
                    {totalPages > 0 && (
                      <span className="block mt-2 text-sm">
                        Total pages: {totalPages} | Selected:{" "}
                        {file.selectedPages.length}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 max-h-[200px] overflow-y-auto p-2 border-2 border-black bg-white">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => togglePageSelection(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center border-2 border-black font-bold transition-all duration-200 ${
                          file.selectedPages.includes(pageNum)
                            ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                            : "bg-white text-black hover:bg-[#4DCCFF] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    onClick={handleSelectAll}
                    className="flex-1 bg-[#4DCCFF] text-black px-3 py-2 border-2 border-black font-bold hover:bg-[#7DDAFF] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="flex-1 bg-white text-black px-3 py-2 border-2 border-black font-bold hover:bg-[#FFDE59] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  >
                    Deselect All
                  </button>
                </div>

                <div className="bg-[#4DCCFF] border-2 border-black p-4 mb-4">
                  <p className="text-black font-bold">
                    Selected: {file.selectedPages.length} pages
                  </p>
                  {file.selectedPages.length > 0 && (
                    <p className="text-black text-sm mt-1">
                      Pages to split:{" "}
                      {file.selectedPages.sort((a, b) => a - b).join(", ")}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSplit}
                  disabled={isSplitting || file.selectedPages.length === 0}
                  className={`w-full bg-[#FF3A5E] text-white px-6 py-3 border-3 border-black font-bold transition-all duration-200 ${
                    isSplitting || file.selectedPages.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#FF6B87] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  }`}
                >
                  {isSplitting ? "Processing..." : "Split Selected Pages"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 mb-8">
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
                Select the PDF file you want to split into multiple files.
              </p>
            </div>
            <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Select Pages to Split
              </h3>
              <p className="text-black">
                Choose which pages you want to split into separate PDFs.
              </p>
            </div>
            <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Download Split PDFs
              </h3>
              <p className="text-black">
                Get your PDFs split into separate files based on your selection.
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
          </div>
        </div>
      </footer>
    </div>
  );
}
