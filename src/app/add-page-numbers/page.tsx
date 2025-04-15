"use client";

import React, { useState } from "react";
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
  numberedUrl?: string;
}

interface PageNumberOptions {
  startNumber: number;
  position: string;
  format: string;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  prefix: string;
  suffix: string;
  margin: number;
  excludeFirstPage: boolean;
  excludeLastPage: boolean;
  customRanges: string;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pageNumberOptions, setPageNumberOptions] = useState<PageNumberOptions>({
    startNumber: 1,
    position: "bottom-center",
    format: "1",
    fontSize: 12,
    fontColor: "#000000",
    fontFamily: "Helvetica",
    prefix: "",
    suffix: "",
    margin: 20,
    excludeFirstPage: false,
    excludeLastPage: false,
    customRanges: "",
  });

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
    if (file) {
      setFile({ ...file, numPages });
    }
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
    setError("Failed to load PDF. Please try again.");
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (file && currentPage < (file.numPages || 1)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePositionChange = (position: string) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      position,
    });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      format: e.target.value,
    });
  };

  const handleStartNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      startNumber: parseInt(e.target.value) || 1,
    });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      fontSize: parseInt(e.target.value) || 12,
    });
  };

  const handleFontColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      fontColor: e.target.value,
    });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      fontFamily: e.target.value,
    });
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      prefix: e.target.value,
    });
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      suffix: e.target.value,
    });
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      margin: parseInt(e.target.value) || 20,
    });
  };

  const handleExcludeFirstPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      excludeFirstPage: e.target.checked,
    });
  };

  const handleExcludeLastPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      excludeLastPage: e.target.checked,
    });
  };

  const handleCustomRangesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumberOptions({
      ...pageNumberOptions,
      customRanges: e.target.value,
    });
  };

  const handleApplyPageNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare form data for API request
      const formData = new FormData();
      formData.append("pdf", file.file);
      
      // Add all page number options to the form data
      Object.entries(pageNumberOptions).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Make API request to add page numbers to PDF
      // Note: This endpoint doesn't exist yet in the backend
      const response = await fetch(`${config.apiBaseUrl}/pdf/add-page-numbers`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Get the numbered PDF as a blob
      const numberedPdfBlob = await response.blob();
      const numberedUrl = URL.createObjectURL(numberedPdfBlob);

      // Update the file with the numbered URL
      setFile({ ...file, numberedUrl });
    } catch (err) {
      console.error("Error adding page numbers:", err);
      setError(err instanceof Error ? err.message : "Failed to add page numbers");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !file.numberedUrl) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = file.numberedUrl;

    // Set the download filename
    const filename = file.name.replace(/\.[^/.]+$/, "") + "_numbered.pdf";
    link.download = filename;

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to get the preview text based on current options
  const getPageNumberPreview = (pageNum: number) => {
    const actualPageNum = pageNumberOptions.startNumber + pageNum - 1;
    let formattedNumber = actualPageNum.toString();
    
    // Apply different formats
    switch (pageNumberOptions.format) {
      case "roman":
        formattedNumber = toRoman(actualPageNum);
        break;
      case "roman-lowercase":
        formattedNumber = toRoman(actualPageNum).toLowerCase();
        break;
      case "letter":
        formattedNumber = toLetter(actualPageNum);
        break;
      case "letter-lowercase":
        formattedNumber = toLetter(actualPageNum).toLowerCase();
        break;
      case "page-of-total":
        formattedNumber = `${actualPageNum} of ${file?.numPages || 1}`;
        break;
      default:
        // Default is just the number
        break;
    }
    
    return `${pageNumberOptions.prefix}${formattedNumber}${pageNumberOptions.suffix}`;
  };

  // Helper function to convert number to Roman numerals
  const toRoman = (num: number): string => {
    const romanNumerals = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    let remaining = num;
    
    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }
    
    return result;
  };

  // Helper function to convert number to letter (A, B, C, ...)
  const toLetter = (num: number): string => {
    let result = '';
    let n = num;
    
    while (n > 0) {
      const remainder = (n - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      n = Math.floor((n - 1) / 26);
    }
    
    return result;
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex-1 relative">
          {!file && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
                  Add Page Numbers to PDF
                </h2>
                <p className="text-xl text-black mb-8 font-medium">
                  Add customizable page numbers to your PDF documents with various styles and positions.
                </p>
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer bg-[#FF3A5E] text-white px-8 py-4 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105 inline-block"
                >
                  Choose PDF File
                </label>
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {file && (
            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-8 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PDF Preview */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    PDF Preview
                  </h3>
                  <div className="flex justify-center items-center bg-gray-100 border-2 border-black min-h-[400px] relative">
                    <Document
                      file={file.numberedUrl || file.url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center h-full w-full">
                          <div className="text-black font-bold">Loading...</div>
                        </div>
                      }
                    >
                      <PdfPage
                        pageNumber={currentPage}
                        width={300}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                    
                    {/* Page number preview overlay */}
                    {!file.numberedUrl && (
                      <div 
                        className={`absolute pointer-events-none text-center px-2 py-1 ${
                          pageNumberOptions.position.includes('top') ? 'top-0 mt-[20px]' : 
                          pageNumberOptions.position.includes('bottom') ? 'bottom-0 mb-[20px]' : 
                          'top-1/2 -translate-y-1/2'
                        } ${
                          pageNumberOptions.position.includes('left') ? 'left-0 ml-[20px] text-left' : 
                          pageNumberOptions.position.includes('right') ? 'right-0 mr-[20px] text-right' : 
                          'left-1/2 -translate-x-1/2'
                        }`}
                        style={{
                          color: pageNumberOptions.fontColor,
                          fontFamily: pageNumberOptions.fontFamily,
                          fontSize: `${pageNumberOptions.fontSize}px`,
                          opacity: 0.8,
                        }}
                      >
                        {(currentPage === 1 && pageNumberOptions.excludeFirstPage) || 
                         (currentPage === file.numPages && pageNumberOptions.excludeLastPage) ? 
                          null : getPageNumberPreview(currentPage)}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                      className={`px-4 py-2 border-2 border-black font-bold transition-all duration-200 ${
                        currentPage <= 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#FFDE59] text-black hover:bg-[#FFE47A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="font-bold">
                      Page {currentPage} of {file.numPages || 1}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={!file.numPages || currentPage >= file.numPages}
                      className={`px-4 py-2 border-2 border-black font-bold transition-all duration-200 ${
                        !file.numPages || currentPage >= file.numPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#FFDE59] text-black hover:bg-[#FFE47A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Page Number Options */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Page Number Options
                  </h3>

                  <div className="space-y-4">
                    {/* Position */}
                    <div>
                      <label className="block text-black font-bold mb-2">
                        Position
                      </label>
                      <div className="flex justify-center">
                        <div className="inline-grid grid-cols-3 gap-1 border-2 border-black p-2 bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          {[
                            "top-left", "top-center", "top-right",
                            "middle-left", "middle-center", "middle-right",
                            "bottom-left", "bottom-center", "bottom-right"
                          ].map((position, index) => (
                            <button
                              key={position}
                              type="button"
                              onClick={() => handlePositionChange(position)}
                              className={`w-[30px] h-[30px] border ${
                                pageNumberOptions.position === position
                                  ? 'border-[#FF3A5E] bg-[#FF3A5E] text-white'
                                  : 'border-black bg-white hover:bg-[#FFDE59]'
                              } flex items-center justify-center transition-all duration-200`}
                              aria-label={`Position ${position}`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full border border-current"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        {pageNumberOptions.position.replace('-', ' ')}
                      </div>
                    </div>

                    {/* Format */}
                    <div>
                      <label className="block text-black font-bold mb-2">
                        Number Format
                      </label>
                      <select
                        value={pageNumberOptions.format}
                        onChange={handleFormatChange}
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                      >
                        <option value="1">1, 2, 3, ...</option>
                        <option value="roman">I, II, III, ...</option>
                        <option value="roman-lowercase">i, ii, iii, ...</option>
                        <option value="letter">A, B, C, ...</option>
                        <option value="letter-lowercase">a, b, c, ...</option>
                        <option value="page-of-total">Page X of Y</option>
                      </select>
                    </div>

                    {/* Start Number */}
                    <div>
                      <label className="block text-black font-bold mb-2">
                        Start Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pageNumberOptions.startNumber}
                        onChange={handleStartNumberChange}
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                      />
                    </div>

                    {/* Font Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Font Size
                        </label>
                        <input
                          type="number"
                          min="8"
                          max="36"
                          value={pageNumberOptions.fontSize}
                          onChange={handleFontSizeChange}
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Font Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={pageNumberOptions.fontColor}
                            onChange={handleFontColorChange}
                            className="w-10 h-10 border-2 border-black cursor-pointer"
                          />
                          <span className="text-black">
                            {pageNumberOptions.fontColor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-black font-bold mb-2">
                        Font Family
                      </label>
                      <select
                        value={pageNumberOptions.fontFamily}
                        onChange={handleFontFamilyChange}
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                      >
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times-Roman">Times Roman</option>
                        <option value="Courier">Courier</option>
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>

                    {/* Prefix and Suffix */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Prefix
                        </label>
                        <input
                          type="text"
                          value={pageNumberOptions.prefix}
                          onChange={handlePrefixChange}
                          placeholder="e.g., 'Page '"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Suffix
                        </label>
                        <input
                          type="text"
                          value={pageNumberOptions.suffix}
                          onChange={handleSuffixChange}
                          placeholder="e.g., ' of 10'"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                        />
                      </div>
                    </div>

                    {/* Margin */}
                    <div>
                      <label className="block text-black font-bold mb-2">
                        Margin (px): {pageNumberOptions.margin}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={pageNumberOptions.margin}
                        onChange={handleMarginChange}
                        className="w-full"
                      />
                    </div>

                    {/* Page Exclusions */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="excludeFirstPage"
                          checked={pageNumberOptions.excludeFirstPage}
                          onChange={handleExcludeFirstPageChange}
                          className="mr-2 h-5 w-5 border-2 border-black"
                        />
                        <label htmlFor="excludeFirstPage" className="text-black font-medium">
                          Exclude first page
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="excludeLastPage"
                          checked={pageNumberOptions.excludeLastPage}
                          onChange={handleExcludeLastPageChange}
                          className="mr-2 h-5 w-5 border-2 border-black"
                        />
                        <label htmlFor="excludeLastPage" className="text-black font-medium">
                          Exclude last page
                        </label>
                      </div>
                    </div>

                    {/* Custom Page Ranges */}
                    <div>
                      <label className="block text-black font-bold mb-2">
                        Custom Page Ranges (optional)
                      </label>
                      <input
                        type="text"
                        value={pageNumberOptions.customRanges}
                        onChange={handleCustomRangesChange}
                        placeholder="e.g., 1-5, 8, 11-13"
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to number all pages. Specify ranges like "1-5, 8, 11-13".
                      </p>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-8">
                    <button
                      onClick={handleApplyPageNumbers}
                      disabled={isProcessing}
                      className={`w-full px-8 py-4 text-xl font-bold border-3 border-black transition-all duration-200 ${
                        isProcessing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#FF3A5E] text-white hover:bg-[#FF6B87] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Add Page Numbers"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {file.numberedUrl && (
                <div className="mt-8 border-3 border-black p-4 bg-[#FFDE59] transform rotate-1">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Numbered PDF Ready!
                  </h3>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-8 py-4 bg-[#FF3A5E] text-white border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105"
                    >
                      Download Numbered PDF
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
