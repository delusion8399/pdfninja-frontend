"use client";

import * as pdfjsLib from "pdfjs-dist";
import React, { useCallback, useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.0.375/build/pdf.worker.min.mjs";

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  numPages?: number;
  pagesToExtract: number[];
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileObj: PDFFile = {
      id: `${selectedFile.name}-${Date.now()}`,
      name: selectedFile.name,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile),
      size: selectedFile.size,
      pagesToExtract: [],
    };

    setFile(fileObj);
    setCurrentPage(1);
  };

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!file || !canvasRef.current) return;

      try {
        const loadingTask = pdfjsLib.getDocument(file.url);
        const pdf = await loadingTask.promise;

        if (!totalPages) {
          setTotalPages(pdf.numPages);
        }

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering PDF page:", error);
      }
    },
    [file, totalPages]
  );

  useEffect(() => {
    if (file) {
      renderPage(currentPage);
    }
  }, [file, currentPage, renderPage]);

  useEffect(() => {
    return () => {
      if (file) {
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

  const togglePageExtraction = (pageNum: number) => {
    if (!file) return;

    setFile((prevFile) => {
      if (!prevFile) return null;

      const pagesToExtract = [...prevFile.pagesToExtract];
      const pageIndex = pagesToExtract.indexOf(pageNum);

      if (pageIndex === -1) {
        pagesToExtract.push(pageNum);
      } else {
        pagesToExtract.splice(pageIndex, 1);
      }

      return {
        ...prevFile,
        pagesToExtract,
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
        pagesToExtract: allPages,
      };
    });
  };

  const handleDeselectAll = () => {
    if (!file) return;

    setFile((prevFile) => {
      if (!prevFile) return null;

      return {
        ...prevFile,
        pagesToExtract: [],
      };
    });
  };

  const handleExtractPages = async () => {
    if (!file || file.pagesToExtract.length === 0) {
      alert("Please select at least one page to extract.");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("pdf", file.file);
    formData.append("pagesToExtract", JSON.stringify(file.pagesToExtract));

    try {
      // This is a placeholder for the actual API call
      // In a real implementation, you would call your backend API
      // For now, we'll simulate processing with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate a processed file (in reality, this would come from the API)
      const processedUrl = file.url; // In a real implementation, this would be the URL of the processed file

      // In a real implementation, you would download the processed file
      const link = document.createElement("a");
      link.href = processedUrl;
      link.download = `${file.name.replace(".pdf", "")}_extracted.pdf`;
      link.click();
    } catch (error) {
      console.error("Error extracting pages from PDF:", error);
      alert("Failed to extract pages from PDF. Please try again.");
    } finally {
      setIsProcessing(false);
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
        <div className="flex-1 relative">
          {!file && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
                  Extract Pages from PDF
                </h2>
                <p className="text-xl text-black mb-8 font-medium">
                  Easily extract specific pages from your PDF documents with our
                  free tool.
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
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PDF Preview */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    PDF Preview
                  </h3>
                  <div className="flex justify-center items-center bg-gray-100 border-2 border-black min-h-[400px]">
                    <canvas ref={canvasRef} className="max-w-full" />
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
                      Size: {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {/* Page Selection */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Select Pages to Extract
                  </h3>
                  <div className="bg-[#FFDE59] border-2 border-black p-4 mb-4">
                    <p className="text-black font-medium">
                      Click on the page numbers below to select which pages you
                      want to extract from the PDF.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 max-h-[200px] overflow-y-auto p-2 border-2 border-black">
                    {totalPages > 0 &&
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => togglePageExtraction(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center border-2 border-black font-bold ${
                              file.pagesToExtract.includes(pageNum)
                                ? "bg-[#FF3A5E] text-white"
                                : "bg-white text-black hover:bg-[#4DCCFF]"
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
                      className="flex-1 bg-[#4DCCFF] text-black px-3 py-2 border-2 border-black font-bold hover:bg-[#7DDAFF] transition-all duration-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="flex-1 bg-white text-black px-3 py-2 border-2 border-black font-bold hover:bg-[#FFDE59] transition-all duration-200"
                    >
                      Deselect All
                    </button>
                  </div>

                  <div className="bg-[#4DCCFF] border-2 border-black p-4 mb-4">
                    <p className="text-black font-bold">
                      Selected: {file.pagesToExtract.length} pages
                    </p>
                    {file.pagesToExtract.length > 0 && (
                      <p className="text-black text-sm mt-1">
                        Pages to extract:{" "}
                        {file.pagesToExtract.sort((a, b) => a - b).join(", ")}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleExtractPages}
                    disabled={isProcessing || file.pagesToExtract.length === 0}
                    className={`w-full bg-[#FF3A5E] text-white px-6 py-3 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                      isProcessing || file.pagesToExtract.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isProcessing ? "Processing..." : "Extract Selected Pages"}
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
                  Select the PDF file you want to extract pages from.
                </p>
              </div>
              <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Select Pages to Extract
                </h3>
                <p className="text-black">
                  Choose which pages you want to keep in your new document.
                </p>
              </div>
              <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Download New PDF
                </h3>
                <p className="text-black">
                  Get your new PDF containing only the pages you selected.
                </p>
              </div>
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
