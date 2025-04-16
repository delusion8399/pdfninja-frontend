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

// Define rotation angles
type RotationAngle = 0 | 90 | 180 | 270;

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  numPages?: number;
  pageRotations: Record<number, RotationAngle>; // Maps page number to rotation angle
  rotatedUrl?: string;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
      pageRotations: {},
    };

    setFile(fileObj);
    setCurrentPage(1);
    setError(null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    if (file) {
      // Initialize rotation for all pages to 0
      const rotations: Record<number, RotationAngle> = {};
      for (let i = 1; i <= numPages; i++) {
        rotations[i] = 0;
      }
      setFile({ ...file, numPages, pageRotations: rotations });
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

  const handleRotate = (angle: RotationAngle) => {
    if (!file) return;

    // Calculate new rotation (add the angle and keep it within 0-270 range)
    const currentRotation = file.pageRotations[currentPage] || 0;
    const newRotation = (currentRotation + angle) % 360 as RotationAngle;

    // Update the rotation for the current page
    const updatedRotations = { ...file.pageRotations };
    updatedRotations[currentPage] = newRotation;

    setFile({ ...file, pageRotations: updatedRotations });
  };

  const handleRotateAll = (angle: RotationAngle) => {
    if (!file || !file.numPages) return;

    // Update rotation for all pages
    const updatedRotations: Record<number, RotationAngle> = {};
    for (let i = 1; i <= file.numPages; i++) {
      const currentRotation = file.pageRotations[i] || 0;
      updatedRotations[i] = (currentRotation + angle) % 360 as RotationAngle;
    }

    setFile({ ...file, pageRotations: updatedRotations });
  };

  const handleResetRotation = () => {
    if (!file || !file.numPages) return;

    // Reset rotation for the current page to 0
    const updatedRotations = { ...file.pageRotations };
    updatedRotations[currentPage] = 0;

    setFile({ ...file, pageRotations: updatedRotations });
  };

  const handleResetAllRotations = () => {
    if (!file || !file.numPages) return;

    // Reset all rotations to 0
    const updatedRotations: Record<number, RotationAngle> = {};
    for (let i = 1; i <= file.numPages; i++) {
      updatedRotations[i] = 0;
    }

    setFile({ ...file, pageRotations: updatedRotations });
  };

  const handleApplyRotations = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare form data for API request
      const formData = new FormData();
      formData.append("pdf", file.file);

      // Convert page rotations to JSON string
      const rotationsData = JSON.stringify(file.pageRotations);
      formData.append("pageRotations", rotationsData);

      // Make API request to rotate PDF
      const response = await fetch(`${config.apiBaseUrl}/pdf/rotate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Get the rotated PDF as a blob
      const rotatedPdfBlob = await response.blob();
      const rotatedUrl = URL.createObjectURL(rotatedPdfBlob);

      // Update the file with the rotated URL
      setFile({ ...file, rotatedUrl });
    } catch (err) {
      console.error("Error rotating PDF:", err);
      setError("Failed to rotate PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !file.rotatedUrl) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = file.rotatedUrl;

    // Set the download filename
    const filename = file.name.replace(/\.[^/.]+$/, "") + "_rotated.pdf";
    link.download = filename;

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#4DCCFF] antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex-1 relative">
          {!file && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
                  Rotate PDF Pages
                </h2>
                <p className="text-xl text-black mb-8 font-medium">
                  Rotate pages in your PDF document to the correct orientation.
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
                      file={file.url}
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
                        rotate={file.pageRotations[currentPage] || 0}
                      />
                    </Document>
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

                {/* Rotation Controls */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Rotation Controls
                  </h3>

                  <div className="mb-6">
                    <h4 className="font-bold mb-2">Current Page</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleRotate(90)}
                        className="px-4 py-2 bg-[#FFDE59] text-black border-2 border-black font-bold hover:bg-[#FFE47A] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      >
                        Rotate 90° Clockwise
                      </button>
                      <button
                        onClick={() => handleRotate(180)}
                        className="px-4 py-2 bg-[#FFDE59] text-black border-2 border-black font-bold hover:bg-[#FFE47A] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      >
                        Rotate 180°
                      </button>
                    </div>
                    <button
                      onClick={handleResetRotation}
                      className="w-full px-4 py-2 bg-gray-200 text-black border-2 border-black font-bold hover:bg-gray-300 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    >
                      Reset Current Page
                    </button>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold mb-2">All Pages</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleRotateAll(90)}
                        className="px-4 py-2 bg-[#4DCCFF] text-black border-2 border-black font-bold hover:bg-[#7AD9FF] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      >
                        Rotate All 90°
                      </button>
                      <button
                        onClick={() => handleRotateAll(180)}
                        className="px-4 py-2 bg-[#4DCCFF] text-black border-2 border-black font-bold hover:bg-[#7AD9FF] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      >
                        Rotate All 180°
                      </button>
                    </div>
                    <button
                      onClick={handleResetAllRotations}
                      className="w-full px-4 py-2 bg-gray-200 text-black border-2 border-black font-bold hover:bg-gray-300 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    >
                      Reset All Pages
                    </button>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleApplyRotations} // Using real API endpoint
                      disabled={isProcessing}
                      className={`w-full px-8 py-4 text-xl font-bold border-3 border-black transition-all duration-200 ${
                        isProcessing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#FF3A5E] text-white hover:bg-[#FF6B87] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Apply Rotations"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {file.rotatedUrl && (
                <div className="mt-8 border-3 border-black p-4 bg-[#FFDE59] transform rotate-1">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Rotated PDF Ready!
                  </h3>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-8 py-4 bg-[#FF3A5E] text-white border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105"
                    >
                      Download Rotated PDF
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
